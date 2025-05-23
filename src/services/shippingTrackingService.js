/**
 * Shipping Tracking Service
 * 
 * This service provides integration with shipping carriers (UPS, FedEx, USPS)
 * to track packages and update order status in the database.
 */

import { supabase } from '../lib/supabase';
import axios from 'axios';

// Configuration for different carriers
const CARRIER_CONFIG = {
  UPS: {
    apiUrl: process.env.REACT_APP_UPS_API_URL || 'https://onlinetools.ups.com/api',
    clientId: process.env.REACT_APP_UPS_CLIENT_ID,
    clientSecret: process.env.REACT_APP_UPS_CLIENT_SECRET,
  },
  FEDEX: {
    apiUrl: process.env.REACT_APP_FEDEX_API_URL || 'https://apis.fedex.com',
    clientId: process.env.REACT_APP_FEDEX_CLIENT_ID,
    clientSecret: process.env.REACT_APP_FEDEX_CLIENT_SECRET,
  },
  USPS: {
    apiUrl: process.env.REACT_APP_USPS_API_URL || 'https://secure.shippingapis.com/ShippingAPI.dll',
    userId: process.env.REACT_APP_USPS_USER_ID,
  }
};

// Carrier detection based on tracking number format
const detectCarrier = (trackingNumber) => {
  if (!trackingNumber) return null;
  
  // UPS tracking number format (1Z + 15-16 alphanumeric)
  if (/^1Z[0-9A-Z]{16}$/i.test(trackingNumber)) {
    return 'UPS';
  }
  
  // FedEx tracking number formats
  if (/^(\d{12}|\d{15}|96\d{20})$/.test(trackingNumber)) {
    return 'FEDEX';
  }
  
  // USPS tracking number formats
  if (/^(9[2-5]\d{19}|[A-Z]{2}\d{9}US)$/i.test(trackingNumber)) {
    return 'USPS';
  }
  
  return 'UNKNOWN';
};

/**
 * Get authentication token for UPS API
 * @returns {Promise<string>} Authentication token
 */
const getUPSAuthToken = async () => {
  try {
    const { clientId, clientSecret, apiUrl } = CARRIER_CONFIG.UPS;
    
    if (!clientId || !clientSecret) {
      console.error('UPS API credentials not configured');
      return null;
    }
    
    const response = await axios.post(
      `${apiUrl}/security/v1/oauth/token`,
      {
        grant_type: 'client_credentials',
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: clientId,
          password: clientSecret,
        },
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting UPS auth token:', error);
    return null;
  }
};

/**
 * Get authentication token for FedEx API
 * @returns {Promise<string>} Authentication token
 */
const getFedExAuthToken = async () => {
  try {
    const { clientId, clientSecret, apiUrl } = CARRIER_CONFIG.FEDEX;
    
    if (!clientId || !clientSecret) {
      console.error('FedEx API credentials not configured');
      return null;
    }
    
    const response = await axios.post(
      `${apiUrl}/oauth/token`,
      {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting FedEx auth token:', error);
    return null;
  }
};

/**
 * Track a UPS package
 * @param {string} trackingNumber - UPS tracking number
 * @returns {Promise<Object>} Tracking information
 */
const trackUPSPackage = async (trackingNumber) => {
  try {
    const { apiUrl } = CARRIER_CONFIG.UPS;
    const token = await getUPSAuthToken();
    
    if (!token) {
      throw new Error('Failed to get UPS authentication token');
    }
    
    const response = await axios.get(
      `${apiUrl}/track/v1/details/${trackingNumber}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return normalizeTrackingData('UPS', response.data);
  } catch (error) {
    console.error('Error tracking UPS package:', error);
    return { error: error.message || 'Failed to track UPS package' };
  }
};

/**
 * Track a FedEx package
 * @param {string} trackingNumber - FedEx tracking number
 * @returns {Promise<Object>} Tracking information
 */
const trackFedExPackage = async (trackingNumber) => {
  try {
    const { apiUrl } = CARRIER_CONFIG.FEDEX;
    const token = await getFedExAuthToken();
    
    if (!token) {
      throw new Error('Failed to get FedEx authentication token');
    }
    
    const response = await axios.post(
      `${apiUrl}/track/v1/trackingnumbers`,
      {
        trackingInfo: [
          {
            trackingNumberInfo: {
              trackingNumber: trackingNumber,
            },
          },
        ],
        includeDetailedScans: true,
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return normalizeTrackingData('FEDEX', response.data);
  } catch (error) {
    console.error('Error tracking FedEx package:', error);
    return { error: error.message || 'Failed to track FedEx package' };
  }
};

/**
 * Track a USPS package
 * @param {string} trackingNumber - USPS tracking number
 * @returns {Promise<Object>} Tracking information
 */
const trackUSPSPackage = async (trackingNumber) => {
  try {
    const { apiUrl, userId } = CARRIER_CONFIG.USPS;
    
    if (!userId) {
      console.error('USPS API credentials not configured');
      return { error: 'USPS API credentials not configured' };
    }
    
    // USPS uses XML-based API
    const xml = `
      <TrackFieldRequest USERID="${userId}">
        <TrackID ID="${trackingNumber}"></TrackID>
      </TrackFieldRequest>
    `;
    
    const response = await axios.get(apiUrl, {
      params: {
        API: 'TrackV2',
        XML: xml,
      },
    });
    
    // Parse XML response
    // For simplicity, we're using a basic approach here
    // In production, use a proper XML parser
    const trackInfo = response.data;
    
    return normalizeTrackingData('USPS', trackInfo);
  } catch (error) {
    console.error('Error tracking USPS package:', error);
    return { error: error.message || 'Failed to track USPS package' };
  }
};

/**
 * Normalize tracking data from different carriers into a standard format
 * @param {string} carrier - Carrier name (UPS, FEDEX, USPS)
 * @param {Object} data - Raw tracking data from carrier API
 * @returns {Object} Normalized tracking data
 */
const normalizeTrackingData = (carrier, data) => {
  try {
    let normalizedData = {
      carrier,
      trackingNumber: '',
      status: '',
      statusDescription: '',
      estimatedDelivery: null,
      deliveredAt: null,
      shipDate: null,
      events: [],
      lastUpdated: new Date().toISOString(),
    };
    
    switch (carrier) {
      case 'UPS':
        if (data.trackResponse && data.trackResponse.shipment) {
          const shipment = data.trackResponse.shipment[0];
          normalizedData.trackingNumber = shipment.trackingNumber;
          normalizedData.status = mapUPSStatusToStandard(shipment.currentStatus.code);
          normalizedData.statusDescription = shipment.currentStatus.description;
          
          if (shipment.deliveryDate) {
            normalizedData.estimatedDelivery = shipment.deliveryDate[0].date;
          }
          
          if (shipment.package && shipment.package[0].activity) {
            normalizedData.events = shipment.package[0].activity.map(activity => ({
              timestamp: activity.date + 'T' + activity.time,
              location: activity.location?.address?.city + ', ' + activity.location?.address?.stateProvince,
              description: activity.status?.description || '',
            }));
            
            // Find ship date (first event)
            const firstEvent = [...normalizedData.events].sort((a, b) => 
              new Date(a.timestamp) - new Date(b.timestamp)
            )[0];
            if (firstEvent) {
              normalizedData.shipDate = firstEvent.timestamp;
            }
            
            // Find delivery date if delivered
            if (normalizedData.status === 'delivered') {
              const deliveryEvent = normalizedData.events.find(e => 
                e.description.toLowerCase().includes('delivered')
              );
              if (deliveryEvent) {
                normalizedData.deliveredAt = deliveryEvent.timestamp;
              }
            }
          }
        }
        break;
        
      case 'FEDEX':
        if (data.output && data.output.completeTrackResults) {
          const trackResult = data.output.completeTrackResults[0];
          const trackDetail = trackResult.trackResults[0];
          
          normalizedData.trackingNumber = trackDetail.trackingNumber;
          normalizedData.status = mapFedExStatusToStandard(trackDetail.latestStatusDetail.code);
          normalizedData.statusDescription = trackDetail.latestStatusDetail.description;
          
          if (trackDetail.estimatedDeliveryTimeWindow) {
            normalizedData.estimatedDelivery = trackDetail.estimatedDeliveryTimeWindow.window.ends;
          }
          
          if (trackDetail.dateAndTimes) {
            const shipDateInfo = trackDetail.dateAndTimes.find(d => d.type === 'SHIP');
            if (shipDateInfo) {
              normalizedData.shipDate = shipDateInfo.dateTime;
            }
            
            const deliveryDateInfo = trackDetail.dateAndTimes.find(d => d.type === 'ACTUAL_DELIVERY');
            if (deliveryDateInfo) {
              normalizedData.deliveredAt = deliveryDateInfo.dateTime;
            }
          }
          
          if (trackDetail.scanEvents) {
            normalizedData.events = trackDetail.scanEvents.map(event => ({
              timestamp: event.date,
              location: event.scanLocation?.city + ', ' + event.scanLocation?.stateOrProvinceCode,
              description: event.eventDescription,
            }));
          }
        }
        break;
        
      case 'USPS':
        // USPS XML parsing would go here
        // This is simplified for the example
        if (data.TrackResponse && data.TrackResponse.TrackInfo) {
          const trackInfo = data.TrackResponse.TrackInfo;
          
          normalizedData.trackingNumber = trackInfo.ID;
          normalizedData.status = mapUSPSStatusToStandard(trackInfo.Status);
          normalizedData.statusDescription = trackInfo.Status;
          
          if (trackInfo.ExpectedDeliveryDate) {
            normalizedData.estimatedDelivery = trackInfo.ExpectedDeliveryDate;
          }
          
          if (trackInfo.TrackSummary) {
            normalizedData.events = [
              {
                timestamp: trackInfo.TrackSummary.EventDate + 'T' + trackInfo.TrackSummary.EventTime,
                location: trackInfo.TrackSummary.EventCity + ', ' + trackInfo.TrackSummary.EventState,
                description: trackInfo.TrackSummary.Event,
              }
            ];
          }
          
          if (trackInfo.TrackDetail) {
            const trackDetails = Array.isArray(trackInfo.TrackDetail) 
              ? trackInfo.TrackDetail 
              : [trackInfo.TrackDetail];
              
            trackDetails.forEach(detail => {
              normalizedData.events.push({
                timestamp: detail.EventDate + 'T' + detail.EventTime,
                location: detail.EventCity + ', ' + detail.EventState,
                description: detail.Event,
              });
            });
            
            // Sort events by timestamp
            normalizedData.events.sort((a, b) => 
              new Date(b.timestamp) - new Date(a.timestamp)
            );
            
            // Find ship date (first event)
            const firstEvent = [...normalizedData.events].sort((a, b) => 
              new Date(a.timestamp) - new Date(b.timestamp)
            )[0];
            if (firstEvent) {
              normalizedData.shipDate = firstEvent.timestamp;
            }
            
            // Find delivery date if delivered
            if (normalizedData.status === 'delivered') {
              const deliveryEvent = normalizedData.events.find(e => 
                e.description.toLowerCase().includes('delivered')
              );
              if (deliveryEvent) {
                normalizedData.deliveredAt = deliveryEvent.timestamp;
              }
            }
          }
        }
        break;
        
      default:
        return { error: 'Unsupported carrier' };
    }
    
    return normalizedData;
  } catch (error) {
    console.error('Error normalizing tracking data:', error);
    return { 
      error: 'Failed to normalize tracking data',
      carrier,
      rawData: data
    };
  }
};

/**
 * Map UPS status codes to standard status values
 * @param {string} upsStatus - UPS status code
 * @returns {string} Standard status value
 */
const mapUPSStatusToStandard = (upsStatus) => {
  const statusMap = {
    'D': 'delivered',
    'I': 'in_transit',
    'X': 'exception',
    'P': 'pickup',
    'M': 'manifest',
    'O': 'out_for_delivery',
  };
  
  return statusMap[upsStatus] || 'unknown';
};

/**
 * Map FedEx status codes to standard status values
 * @param {string} fedexStatus - FedEx status code
 * @returns {string} Standard status value
 */
const mapFedExStatusToStandard = (fedexStatus) => {
  const statusMap = {
    'DL': 'delivered',
    'IT': 'in_transit',
    'FD': 'exception',
    'PU': 'pickup',
    'OD': 'out_for_delivery',
    'DP': 'departed',
    'AR': 'arrived',
  };
  
  return statusMap[fedexStatus] || 'unknown';
};

/**
 * Map USPS status descriptions to standard status values
 * @param {string} uspsStatus - USPS status description
 * @returns {string} Standard status value
 */
const mapUSPSStatusToStandard = (uspsStatus) => {
  const uspsStatusLower = uspsStatus.toLowerCase();
  
  if (uspsStatusLower.includes('delivered')) {
    return 'delivered';
  } else if (uspsStatusLower.includes('out for delivery')) {
    return 'out_for_delivery';
  } else if (uspsStatusLower.includes('arrival')) {
    return 'arrived';
  } else if (uspsStatusLower.includes('transit')) {
    return 'in_transit';
  } else if (uspsStatusLower.includes('alert') || uspsStatusLower.includes('exception')) {
    return 'exception';
  } else if (uspsStatusLower.includes('acceptance') || uspsStatusLower.includes('picked up')) {
    return 'pickup';
  } else if (uspsStatusLower.includes('pre-shipment')) {
    return 'manifest';
  }
  
  return 'unknown';
};

/**
 * Track a package using the appropriate carrier API
 * @param {string} trackingNumber - Tracking number
 * @param {string} [carrier] - Carrier name (optional, will be detected if not provided)
 * @returns {Promise<Object>} Tracking information
 */
export const trackPackage = async (trackingNumber, carrier = null) => {
  if (!trackingNumber) {
    return { error: 'Tracking number is required' };
  }
  
  // Detect carrier if not provided
  const detectedCarrier = carrier || detectCarrier(trackingNumber);
  
  switch (detectedCarrier) {
    case 'UPS':
      return trackUPSPackage(trackingNumber);
    case 'FEDEX':
      return trackFedExPackage(trackingNumber);
    case 'USPS':
      return trackUSPSPackage(trackingNumber);
    default:
      return { 
        error: 'Unable to determine carrier or unsupported carrier',
        trackingNumber,
        detectedCarrier
      };
  }
};

/**
 * Update order status based on tracking information
 * @param {string} orderId - Order ID
 * @param {string} trackingNumber - Tracking number
 * @returns {Promise<Object>} Updated order information
 */
export const updateOrderStatusFromTracking = async (orderId, trackingNumber) => {
  try {
    if (!orderId || !trackingNumber) {
      return { error: 'Order ID and tracking number are required' };
    }
    
    // Get tracking information
    const trackingInfo = await trackPackage(trackingNumber);
    
    if (trackingInfo.error) {
      return { error: trackingInfo.error };
    }
    
    // Map tracking status to order status
    let orderStatus;
    switch (trackingInfo.status) {
      case 'delivered':
        orderStatus = 'delivered';
        break;
      case 'out_for_delivery':
        orderStatus = 'out_for_delivery';
        break;
      case 'in_transit':
      case 'arrived':
      case 'departed':
        orderStatus = 'in_transit';
        break;
      case 'pickup':
      case 'manifest':
        orderStatus = 'processing';
        break;
      case 'exception':
        orderStatus = 'exception';
        break;
      default:
        orderStatus = 'processing';
    }
    
    // Update order in database
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        tracking_info: trackingInfo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select();
      
    if (error) {
      console.error('Error updating order status:', error);
      return { error: 'Failed to update order status' };
    }
    
    // Create tracking event in database
    await supabase
      .from('order_tracking_events')
      .insert({
        order_id: orderId,
        tracking_number: trackingNumber,
        status: orderStatus,
        carrier: trackingInfo.carrier,
        tracking_data: trackingInfo,
        created_at: new Date().toISOString(),
      });
    
    return { 
      success: true, 
      order: data[0],
      trackingInfo
    };
  } catch (error) {
    console.error('Error in updateOrderStatusFromTracking:', error);
    return { error: error.message || 'Failed to update order status' };
  }
};

/**
 * Get tracking history for an order
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Tracking history
 */
export const getOrderTrackingHistory = async (orderId) => {
  try {
    if (!orderId) {
      return { error: 'Order ID is required' };
    }
    
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, tracking_number, status, tracking_info')
      .eq('id', orderId)
      .single();
      
    if (orderError) {
      console.error('Error getting order details:', orderError);
      return { error: 'Failed to get order details' };
    }
    
    if (!order) {
      return { error: 'Order not found' };
    }
    
    // Get tracking events
    const { data: events, error: eventsError } = await supabase
      .from('order_tracking_events')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });
      
    if (eventsError) {
      console.error('Error getting tracking events:', eventsError);
      return { error: 'Failed to get tracking events' };
    }
    
    return {
      order,
      events: events || [],
    };
  } catch (error) {
    console.error('Error in getOrderTrackingHistory:', error);
    return { error: error.message || 'Failed to get tracking history' };
  }
};

/**
 * Schedule tracking updates for an order
 * @param {string} orderId - Order ID
 * @param {string} trackingNumber - Tracking number
 * @param {number} [intervalHours=24] - Update interval in hours
 * @returns {Promise<Object>} Result
 */
export const scheduleTrackingUpdates = async (orderId, trackingNumber, intervalHours = 24) => {
  try {
    if (!orderId || !trackingNumber) {
      return { error: 'Order ID and tracking number are required' };
    }
    
    // This would typically be handled by a background job scheduler
    // For this example, we'll just create a record in the database
    
    const { data, error } = await supabase
      .from('tracking_update_schedule')
      .insert({
        order_id: orderId,
        tracking_number: trackingNumber,
        interval_hours: intervalHours,
        next_update: new Date(Date.now() + intervalHours * 60 * 60 * 1000).toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select();
      
    if (error) {
      console.error('Error scheduling tracking updates:', error);
      return { error: 'Failed to schedule tracking updates' };
    }
    
    return { 
      success: true, 
      schedule: data[0]
    };
  } catch (error) {
    console.error('Error in scheduleTrackingUpdates:', error);
    return { error: error.message || 'Failed to schedule tracking updates' };
  }
};

export default {
  trackPackage,
  updateOrderStatusFromTracking,
  getOrderTrackingHistory,
  scheduleTrackingUpdates,
};
