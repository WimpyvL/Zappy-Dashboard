export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_logs: {
        Row: {
          created_at: string
          id: string
          log_type: string | null
          method: string
          path: string
          request_data: Json | null
          response_data: Json | null
          status: number
        }
        Insert: {
          created_at: string
          id?: string
          log_type?: string | null
          method: string
          path: string
          request_data?: Json | null
          response_data?: Json | null
          status: number
        }
        Update: {
          created_at?: string
          id?: string
          log_type?: string | null
          method?: string
          path?: string
          request_data?: Json | null
          response_data?: Json | null
          status?: number
        }
        Relationships: []
      }
      blacklists: {
        Row: {
          address: Json | null
          category: string
          created_at: string
          description: string | null
          id: string
          updated_at: string
          value: string | null
        }
        Insert: {
          address?: Json | null
          category: string
          created_at: string
          description?: string | null
          id?: string
          updated_at: string
          value?: string | null
        }
        Update: {
          address?: Json | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      category: {
        Row: {
          created_at: string
          id: string
          keywords: string[] | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at: string
          id?: string
          keywords?: string[] | null
          name: string
          updated_at: string
        }
        Update: {
          created_at?: string
          id?: string
          keywords?: string[] | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      check_in: {
        Row: {
          adjusted_dose: number | null
          adjusted_units: number | null
          patient_id: string
          created_at: string
          date: string
          id: string
          last_vial_used: string | null
          medication: string | null
          satisfaction: number | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          adjusted_dose?: number | null
          adjusted_units?: number | null
          patient_id: string
          created_at: string
          date: string
          id?: string
          last_vial_used?: string | null
          medication?: string | null
          satisfaction?: number | null
          updated_at: string
          weight?: number | null
        }
        Update: {
          adjusted_dose?: number | null
          adjusted_units?: number | null
          patient_id?: string
          created_at?: string
          date?: string
          id?: string
          last_vial_used?: string | null
          medication?: string | null
          satisfaction?: number | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          blacklisted: boolean | null
          date_created: string
          email: string | null
          first_name: string | null
          go_high_level_id: string | null
          id: string
          id_uploaded: boolean | null
          id_verification_reminder_sent_at: string | null
          invitation_sent: boolean
          is_active: boolean
          is_child_record: boolean
          last_activity_date: string | null
          last_name: string | null
          mobile_phone: string | null
          phone: string | null
          phone_number_kc: string | null
          pro_rx_id: string | null
          profile: Json | null
          record_created: string | null
          record_modified: string | null
          related_tags: string[] | null
          status: string | null
          stripe_client_secret: string | null
          stripe_id: string | null
          stripe_verification: boolean | null
          time_zone: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          blacklisted?: boolean | null
          date_created: string
          email?: string | null
          first_name?: string | null
          go_high_level_id?: string | null
          id?: string
          id_uploaded?: boolean | null
          id_verification_reminder_sent_at?: string | null
          invitation_sent: boolean
          is_active: boolean
          is_child_record: boolean
          last_activity_date?: string | null
          last_name?: string | null
          mobile_phone?: string | null
          phone?: string | null
          phone_number_kc?: string | null
          pro_rx_id?: string | null
          profile?: Json | null
          record_created?: string | null
          record_modified?: string | null
          related_tags?: string[] | null
          status?: string | null
          stripe_client_secret?: string | null
          stripe_id?: string | null
          stripe_verification?: boolean | null
          time_zone?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          blacklisted?: boolean | null
          date_created?: string
          email?: string | null
          first_name?: string | null
          go_high_level_id?: string | null
          id?: string
          id_uploaded?: boolean | null
          id_verification_reminder_sent_at?: string | null
          invitation_sent?: boolean
          is_active?: boolean
          is_child_record?: boolean
          last_activity_date?: string | null
          last_name?: string | null
          mobile_phone?: string | null
          phone?: string | null
          phone_number_kc?: string | null
          pro_rx_id?: string | null
          profile?: Json | null
          record_created?: string | null
          record_modified?: string | null
          related_tags?: string[] | null
          status?: string | null
          stripe_client_secret?: string | null
          stripe_id?: string | null
          stripe_verification?: boolean | null
          time_zone?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      consultations: {
        Row: {
          client_id: string | null
          client_notes: string | null
          consultation_type: string
          created_at: string | null
          datecompleted: string | null
          datescheduled: string | null
          scheduled_at: string | null
          id: string
          provider_notes: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          client_notes?: string | null
          consultation_type: string
          created_at?: string | null
          datecompleted?: string | null
          datescheduled?: string | null
          scheduled_at?: string | null
          id?: string
          provider_notes?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          client_notes?: string | null
          consultation_type?: string
          created_at?: string | null
          datecompleted?: string | null
          datescheduled?: string | null
          scheduled_at?: string | null
          id?: string
          provider_notes?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      crisp_session: {
        Row: {
          assigned_to_bot: boolean | null
          client_record_id: string | null
          conversation_messages: Json | null
          conversation_processed: boolean | null
          created_at: string
          crisp_session_id: string | null
          id: string
          updated_at: string
          valid_till: string
          verified: boolean | null
        }
        Insert: {
          assigned_to_bot?: boolean | null
          client_record_id?: string | null
          conversation_messages?: Json | null
          conversation_processed?: boolean | null
          created_at: string
          crisp_session_id?: string | null
          id?: string
          updated_at: string
          valid_till: string
          verified?: boolean | null
        }
        Update: {
          assigned_to_bot?: boolean | null
          client_record_id?: string | null
          conversation_messages?: Json | null
          conversation_processed?: boolean | null
          created_at?: string
          crisp_session_id?: string | null
          id?: string
          updated_at?: string
          valid_till?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      discounts: {
        Row: {
          amount: number
          code: string | null
          created_at: string
          description: string | null
          id: string
          name: string | null
          percentage: number
          status: boolean | null
          updated_at: string
        }
        Insert: {
          amount: number
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
          percentage: number
          status?: boolean | null
          updated_at?: string
        }
        Update: {
          amount?: number
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
          percentage?: number
          status?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string | null
          file_name: string
          id: string
          resource: string | null
          resource_id: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          id?: string
          resource?: string | null
          resource_id?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          id?: string
          resource?: string | null
          resource_id?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          body: string
          client_record_id: string
          created_at: string | null
          id: string
          message_id: string | null
          meta_data: Json
          name: string | null
          order_id: string | null
          status: string
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          body: string
          client_record_id: string
          created_at?: string | null
          id?: string
          message_id?: string | null
          meta_data: Json
          name?: string | null
          order_id?: string | null
          status: string
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          body?: string
          client_record_id?: string
          created_at?: string | null
          id?: string
          message_id?: string | null
          meta_data?: Json
          name?: string | null
          order_id?: string | null
          status?: string
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_email_logs_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order"
            referencedColumns: ["id"]
          },
        ]
      }
      form_requests: {
        Row: {
          ai_processed: boolean | null
          client_record_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string
          current_medication: string | null
          discount: string | null
          discount_dict: Json
          dose: string | null
          form_id: string
          form_request_data: Json
          form_request_id: string
          goals: string | null
          has_order: boolean | null
          has_order_note: boolean | null
          has_order_temp: boolean | null
          has_package: boolean | null
          has_pp: boolean | null
          has_session_note: boolean | null
          has_sessions: boolean | null
          ic_assessment_and_plan: string | null
          ic_hpi: string | null
          ic_pmh: string | null
          id: string
          medication: string | null
          message_to_patient: string | null
          order_note_id: string | null
          package_id: string | null
          preferred_dose: string | null
          preferred_medications: string | null
          preferred_plan: string | null
          prescription_notes: string | null
          promo_code: string | null
          reviewed_at: string | null
          send_review: boolean | null
          service: string | null
          session_id: string | null
          session_note_id: string | null
          session_note_sms_send: boolean | null
          starter_pack: boolean | null
          status: string | null
          submit: boolean | null
          task_message: string | null
          trustpilot_status: string | null
          updated_at: string
          user_id: string | null
          weight: string | null
        }
        Insert: {
          ai_processed?: boolean | null
          client_record_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at: string
          current_medication?: string | null
          discount?: string | null
          discount_dict: Json
          dose?: string | null
          form_id: string
          form_request_data: Json
          form_request_id: string
          goals?: string | null
          has_order?: boolean | null
          has_order_note?: boolean | null
          has_order_temp?: boolean | null
          has_package?: boolean | null
          has_pp?: boolean | null
          has_session_note?: boolean | null
          has_sessions?: boolean | null
          ic_assessment_and_plan?: string | null
          ic_hpi?: string | null
          ic_pmh?: string | null
          id?: string
          medication?: string | null
          message_to_patient?: string | null
          order_note_id?: string | null
          package_id?: string | null
          preferred_dose?: string | null
          preferred_medications?: string | null
          preferred_plan?: string | null
          prescription_notes?: string | null
          promo_code?: string | null
          reviewed_at?: string | null
          send_review?: boolean | null
          service?: string | null
          session_id?: string | null
          session_note_id?: string | null
          session_note_sms_send?: boolean | null
          starter_pack?: boolean | null
          status?: string | null
          submit?: boolean | null
          task_message?: string | null
          trustpilot_status?: string | null
          updated_at: string
          user_id?: string | null
          weight?: string | null
        }
        Update: {
          ai_processed?: boolean | null
          client_record_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_medication?: string | null
          discount?: string | null
          discount_dict?: Json
          dose?: string | null
          form_id?: string
          form_request_data?: Json
          form_request_id?: string
          goals?: string | null
          has_order?: boolean | null
          has_order_note?: boolean | null
          has_order_temp?: boolean | null
          has_package?: boolean | null
          has_pp?: boolean | null
          has_session_note?: boolean | null
          has_sessions?: boolean | null
          ic_assessment_and_plan?: string | null
          ic_hpi?: string | null
          ic_pmh?: string | null
          id?: string
          medication?: string | null
          message_to_patient?: string | null
          order_note_id?: string | null
          package_id?: string | null
          preferred_dose?: string | null
          preferred_medications?: string | null
          preferred_plan?: string | null
          prescription_notes?: string | null
          promo_code?: string | null
          reviewed_at?: string | null
          send_review?: boolean | null
          service?: string | null
          session_id?: string | null
          session_note_id?: string | null
          session_note_sms_send?: boolean | null
          starter_pack?: boolean | null
          status?: string | null
          submit?: boolean | null
          task_message?: string | null
          trustpilot_status?: string | null
          updated_at?: string
          user_id?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_form_requests_package"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_form_requests_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      intent: {
        Row: {
          category_id: string
          created_at: string
          id: string
          question: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at: string
          id?: string
          question: string
          updated_at: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_intent_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          answer: string
          category_id: string
          created_at: string
          id: string
          question: string
          sub_category: string
          updated_at: string
        }
        Insert: {
          answer: string
          category_id: string
          created_at: string
          id?: string
          question: string
          sub_category: string
          updated_at: string
        }
        Update: {
          answer?: string
          category_id?: string
          created_at?: string
          id?: string
          question?: string
          sub_category?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_kb_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base_approval: {
        Row: {
          answer: string
          approved: boolean
          category_id: string
          created_at: string
          id: string
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          approved: boolean
          category_id: string
          created_at: string
          id?: string
          question: string
          updated_at: string
        }
        Update: {
          answer?: string
          approved?: boolean
          category_id?: string
          created_at?: string
          id?: string
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_kb_approval_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
        ]
      }
      langchain_pg_collection: {
        Row: {
          cmetadata: Json | null
          name: string
          uuid: string
        }
        Insert: {
          cmetadata?: Json | null
          name: string
          uuid?: string
        }
        Update: {
          cmetadata?: Json | null
          name?: string
          uuid?: string
        }
        Relationships: []
      }
      langchain_pg_embedding: {
        Row: {
          cmetadata: Json | null
          collection_id: string
          document: string | null
          id: string
        }
        Insert: {
          cmetadata?: Json | null
          collection_id: string
          document?: string | null
          id: string
        }
        Update: {
          cmetadata?: Json | null
          collection_id?: string
          document?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_embedding_collection"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "langchain_pg_collection"
            referencedColumns: ["uuid"]
          },
        ]
      }
      message_store: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      order: {
        Row: {
          added_to_sheet: boolean | null
          client_record_id: string | null
          created_at: string
          created_by_user_id: string | null
          deleted_at: string | null
          form_request_id: string | null
          goals: string | null
          id: string
          initial_dose: number
          is_deleted: boolean
          medication: string | null
          order_created_email_sent: boolean | null
          order_date: string
          order_deleted_by_user_id: string | null
          order_json: Json | null
          order_note_id: string | null
          order_source: string | null
          order_tracking_email_sent: boolean | null
          parent_order_id: string | null
          pb_session_id: string | null
          pharmacy: string | null
          pharmacy_order_id: string | null
          plan_duration: number | null
          quantity: number | null
          reference_order_ids: string[] | null
          send_to_pharmacy_button: boolean | null
          sended_to_pharmacy_at: string | null
          sended_to_pharmacy_by_user_id: string | null
          shipping_carrier: string | null
          sms_sent: boolean | null
          status: string | null
          tracking_number: string | null
          units: number | null
          updated_at: string
          ups_alert: boolean | null
          ups_alert_date: string | null
          ups_status: string | null
          vial_size: number | null
        }
        Insert: {
          added_to_sheet?: boolean | null
          client_record_id?: string | null
          created_at: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          form_request_id?: string | null
          goals?: string | null
          id?: string
          initial_dose: number
          is_deleted?: boolean
          medication?: string | null
          order_created_email_sent?: boolean | null
          order_date: string
          order_deleted_by_user_id?: string | null
          order_json?: Json | null
          order_note_id?: string | null
          order_source?: string | null
          order_tracking_email_sent?: boolean | null
          parent_order_id?: string | null
          pb_session_id?: string | null
          pharmacy?: string | null
          pharmacy_order_id?: string | null
          plan_duration?: number | null
          quantity?: number | null
          reference_order_ids?: string[] | null
          send_to_pharmacy_button?: boolean | null
          sended_to_pharmacy_at?: string | null
          sended_to_pharmacy_by_user_id?: string | null
          shipping_carrier?: string | null
          sms_sent?: boolean | null
          status?: string | null
          tracking_number?: string | null
          units?: number | null
          updated_at: string
          ups_alert?: boolean | null
          ups_alert_date?: string | null
          ups_status?: string | null
          vial_size?: number | null
        }
        Update: {
          added_to_sheet?: boolean | null
          client_record_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          form_request_id?: string | null
          goals?: string | null
          id?: string
          initial_dose?: number
          is_deleted?: boolean
          medication?: string | null
          order_created_email_sent?: boolean | null
          order_date?: string
          order_deleted_by_user_id?: string | null
          order_json?: Json | null
          order_note_id?: string | null
          order_source?: string | null
          order_tracking_email_sent?: boolean | null
          parent_order_id?: string | null
          pb_session_id?: string | null
          pharmacy?: string | null
          pharmacy_order_id?: string | null
          plan_duration?: number | null
          quantity?: number | null
          reference_order_ids?: string[] | null
          send_to_pharmacy_button?: boolean | null
          sended_to_pharmacy_at?: string | null
          sended_to_pharmacy_by_user_id?: string | null
          shipping_carrier?: string | null
          sms_sent?: boolean | null
          status?: string | null
          tracking_number?: string | null
          units?: number | null
          updated_at?: string
          ups_alert?: boolean | null
          ups_alert_date?: string | null
          ups_status?: string | null
          vial_size?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_order_created_by_user"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_deleted_by_user"
            columns: ["order_deleted_by_user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_form_request"
            columns: ["form_request_id"]
            isOneToOne: true
            referencedRelation: "form_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_parent_order"
            columns: ["parent_order_id"]
            isOneToOne: false
            referencedRelation: "order"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_pb_session"
            columns: ["pb_session_id"]
            isOneToOne: true
            referencedRelation: "pb_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_sended_by_user"
            columns: ["sended_to_pharmacy_by_user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          discount: string | null
          id: string
          invoice_amount: number | null
          invoice_amount_boothwyn: number | null
          invoice_amount_redrock: number | null
          invoice_amount_starter: number | null
          invoice_amount_starter_boothwyn: number | null
          invoice_amount_starter_redrock: number | null
          invoice_amount_starter_vios: number | null
          invoice_amount_vios: number | null
          medication: string | null
          payment_plan_2_amount: number | null
          payment_plan_2_duration: number | null
          payment_plan_amount: number | null
          payment_plan_amount_redrock: number | null
          payment_plan_amount_vios: number | null
          payment_plan_duration: number | null
          payment_plan_start_after: number | null
          pb_package_id: string | null
          plan: string | null
          updated_at: string
        }
        Insert: {
          created_at: string
          discount?: string | null
          id?: string
          invoice_amount?: number | null
          invoice_amount_boothwyn?: number | null
          invoice_amount_redrock?: number | null
          invoice_amount_starter?: number | null
          invoice_amount_starter_boothwyn?: number | null
          invoice_amount_starter_redrock?: number | null
          invoice_amount_starter_vios?: number | null
          invoice_amount_vios?: number | null
          medication?: string | null
          payment_plan_2_amount?: number | null
          payment_plan_2_duration?: number | null
          payment_plan_amount?: number | null
          payment_plan_amount_redrock?: number | null
          payment_plan_amount_vios?: number | null
          payment_plan_duration?: number | null
          payment_plan_start_after?: number | null
          pb_package_id?: string | null
          plan?: string | null
          updated_at: string
        }
        Update: {
          created_at?: string
          discount?: string | null
          id?: string
          invoice_amount?: number | null
          invoice_amount_boothwyn?: number | null
          invoice_amount_redrock?: number | null
          invoice_amount_starter?: number | null
          invoice_amount_starter_boothwyn?: number | null
          invoice_amount_starter_redrock?: number | null
          invoice_amount_starter_vios?: number | null
          invoice_amount_vios?: number | null
          medication?: string | null
          payment_plan_2_amount?: number | null
          payment_plan_2_duration?: number | null
          payment_plan_amount?: number | null
          payment_plan_amount_redrock?: number | null
          payment_plan_amount_vios?: number | null
          payment_plan_duration?: number | null
          payment_plan_start_after?: number | null
          pb_package_id?: string | null
          plan?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_packages_pb_package"
            columns: ["pb_package_id"]
            isOneToOne: false
            referencedRelation: "pb_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      pb_client_packages: {
        Row: {
          cancellable: boolean | null
          client_record_id: string | null
          confirmation_status: string | null
          confirmed: boolean | null
          created_at: string
          date_created: string
          date_modified: string | null
          hasSessionHistory: boolean | null
          id: string
          is_ongoing: boolean | null
          is_subscription: boolean | null
          name: string | null
          payment_status: string | null
          pb_client_meta_data: Json
          pb_client_package_id: string
          pb_package_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cancellable?: boolean | null
          client_record_id?: string | null
          confirmation_status?: string | null
          confirmed?: boolean | null
          created_at: string
          date_created: string
          date_modified?: string | null
          hasSessionHistory?: boolean | null
          id?: string
          is_ongoing?: boolean | null
          is_subscription?: boolean | null
          name?: string | null
          payment_status?: string | null
          pb_client_meta_data: Json
          pb_client_package_id: string
          pb_package_id?: string | null
          updated_at: string
          user_id?: string | null
        }
        Update: {
          cancellable?: boolean | null
          client_record_id?: string | null
          confirmation_status?: string | null
          confirmed?: boolean | null
          created_at?: string
          date_created?: string
          date_modified?: string | null
          hasSessionHistory?: boolean | null
          id?: string
          is_ongoing?: boolean | null
          is_subscription?: boolean | null
          name?: string | null
          payment_status?: string | null
          pb_client_meta_data?: Json
          pb_client_package_id?: string
          pb_package_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pb_client_packages_pb_package"
            columns: ["pb_package_id"]
            isOneToOne: false
            referencedRelation: "pb_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pb_client_packages_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      pb_invoices: {
        Row: {
          client_record_id: string | null
          created_at: string
          date_created: string
          date_modified: string
          form_request_id: string | null
          ic_status: boolean | null
          id: string
          pb_invoice_id: string | null
          pb_invoice_metadata: Json
          refunded: boolean
          refunded_amount: number
          status: string | null
          updated_at: string
          vf_status: boolean | null
          virtual_follow_up_id: string | null
        }
        Insert: {
          client_record_id?: string | null
          created_at: string
          date_created: string
          date_modified: string
          form_request_id?: string | null
          ic_status?: boolean | null
          id?: string
          pb_invoice_id?: string | null
          pb_invoice_metadata: Json
          refunded: boolean
          refunded_amount: number
          status?: string | null
          updated_at: string
          vf_status?: boolean | null
          virtual_follow_up_id?: string | null
        }
        Update: {
          client_record_id?: string | null
          created_at?: string
          date_created?: string
          date_modified?: string
          form_request_id?: string | null
          ic_status?: boolean | null
          id?: string
          pb_invoice_id?: string | null
          pb_invoice_metadata?: Json
          refunded?: boolean
          refunded_amount?: number
          status?: string | null
          updated_at?: string
          vf_status?: boolean | null
          virtual_follow_up_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pb_invoices_form_request"
            columns: ["form_request_id"]
            isOneToOne: false
            referencedRelation: "form_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pb_invoices_vf"
            columns: ["virtual_follow_up_id"]
            isOneToOne: false
            referencedRelation: "virtual_follow_ups"
            referencedColumns: ["id"]
          },
        ]
      }
      pb_packages: {
        Row: {
          client_enrollment_enabled: boolean | null
          created_at: string
          id: string
          is_ongoing: boolean | null
          is_shared: boolean | null
          is_subscription: boolean | null
          name: string | null
          package_id: string
          package_meta_data: Json
          sku: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          client_enrollment_enabled?: boolean | null
          created_at: string
          id?: string
          is_ongoing?: boolean | null
          is_shared?: boolean | null
          is_subscription?: boolean | null
          name?: string | null
          package_id: string
          package_meta_data: Json
          sku?: string | null
          updated_at: string
          user_id?: string | null
        }
        Update: {
          client_enrollment_enabled?: boolean | null
          created_at?: string
          id?: string
          is_ongoing?: boolean | null
          is_shared?: boolean | null
          is_subscription?: boolean | null
          name?: string | null
          package_id?: string
          package_meta_data?: Json
          sku?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pb_packages_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      pb_sessions: {
        Row: {
          cancelled: boolean | null
          client_confirmation_status: string | null
          client_record_id: string
          confirmation_status: string | null
          date_created: string
          duration: number | null
          form_request_id: string | null
          id: string
          no_order_required: boolean | null
          order_placed: boolean | null
          other_medication_notification: boolean | null
          pb_invoice_id: string | null
          service_type: string | null
          session_data: Json | null
          session_date: string
          session_id: string
          session_type: string
          time_zone: string | null
          upcoming: boolean | null
          user_id: string | null
          virtual_follow_up_id: string | null
        }
        Insert: {
          cancelled?: boolean | null
          client_confirmation_status?: string | null
          client_record_id: string
          confirmation_status?: string | null
          date_created: string
          duration?: number | null
          form_request_id?: string | null
          id?: string
          no_order_required?: boolean | null
          order_placed?: boolean | null
          other_medication_notification?: boolean | null
          pb_invoice_id?: string | null
          service_type?: string | null
          session_data?: Json | null
          session_date: string
          session_id: string
          session_type: string
          time_zone?: string | null
          upcoming?: boolean | null
          user_id?: string | null
          virtual_follow_up_id?: string | null
        }
        Update: {
          cancelled?: boolean | null
          client_confirmation_status?: string | null
          client_record_id?: string
          confirmation_status?: string | null
          date_created?: string
          duration?: number | null
          form_request_id?: string | null
          id?: string
          no_order_required?: boolean | null
          order_placed?: boolean | null
          other_medication_notification?: boolean | null
          pb_invoice_id?: string | null
          service_type?: string | null
          session_data?: Json | null
          session_date?: string
          session_id?: string
          session_type?: string
          time_zone?: string | null
          upcoming?: boolean | null
          user_id?: string | null
          virtual_follow_up_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pb_sessions_form_request"
            columns: ["form_request_id"]
            isOneToOne: true
            referencedRelation: "form_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pb_sessions_invoice"
            columns: ["pb_invoice_id"]
            isOneToOne: false
            referencedRelation: "pb_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pb_sessions_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pb_sessions_vf"
            columns: ["virtual_follow_up_id"]
            isOneToOne: true
            referencedRelation: "virtual_follow_ups"
            referencedColumns: ["id"]
          },
        ]
      }
      pb_tasks: {
        Row: {
          all_day: boolean | null
          archived: boolean | null
          client_record_id: string
          completed: boolean | null
          created_at: string
          date_created: string
          date_modified: string
          due_date: string | null
          duration: number | null
          id: string
          message: string | null
          notes: string | null
          past_due: boolean | null
          pb_task_id: string | null
          priority: string | null
          reminder_type: string | null
          task_meta_data: Json
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          all_day?: boolean | null
          archived?: boolean | null
          client_record_id: string
          completed?: boolean | null
          created_at?: string
          date_created: string
          date_modified: string
          due_date?: string | null
          duration?: number | null
          id?: string
          message?: string | null
          notes?: string | null
          past_due?: boolean | null
          pb_task_id?: string | null
          priority?: string | null
          reminder_type?: string | null
          task_meta_data: Json
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          all_day?: boolean | null
          archived?: boolean | null
          client_record_id?: string
          completed?: boolean | null
          created_at?: string
          date_created?: string
          date_modified?: string
          due_date?: string | null
          duration?: number | null
          id?: string
          message?: string | null
          notes?: string | null
          past_due?: boolean | null
          pb_task_id?: string | null
          priority?: string | null
          reminder_type?: string | null
          task_meta_data?: Json
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pb_tasks_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at: string
          id?: string
          name: string
          updated_at: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      questionnaire_question: {
        Row: {
          created_at: string
          id: string
          options: Json | null
          question: string
          questionnaire_id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at: string
          id?: string
          options?: Json | null
          question: string
          questionnaire_id: string
          type: string
          updated_at: string
        }
        Update: {
          created_at?: string
          id?: string
          options?: Json | null
          question?: string
          questionnaire_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_question_questionnaire"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaire"
            referencedColumns: ["id"]
          },
        ]
      }
      session: {
        Row: {
          client_record_id: string
          created_at: string
          id: string
          session_name: string | null
          updated_at: string
          valid_till: string | null
        }
        Insert: {
          client_record_id: string
          created_at: string
          id?: string
          session_name?: string | null
          updated_at: string
          valid_till?: string | null
        }
        Update: {
          client_record_id?: string
          created_at?: string
          id?: string
          session_name?: string | null
          updated_at?: string
          valid_till?: string | null
        }
        Relationships: []
      }
      session_chat_history: {
        Row: {
          created_at: string
          id: string
          questionnaire_question_id: string | null
          session_id: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          created_at: string
          id?: string
          questionnaire_question_id?: string | null
          session_id: string
          updated_at: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          questionnaire_question_id?: string | null
          session_id?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_chat_history_question"
            columns: ["questionnaire_question_id"]
            isOneToOne: true
            referencedRelation: "questionnaire_question"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_chat_history_session"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "session"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_logs: {
        Row: {
          client_record_id: string
          created_at: string
          from_number: string
          id: string
          message: string
          order_id: string | null
          sms_sid: string
          status: string
          to_number: string
          updated_at: string
        }
        Insert: {
          client_record_id: string
          created_at: string
          from_number: string
          id?: string
          message: string
          order_id?: string | null
          sms_sid: string
          status: string
          to_number: string
          updated_at: string
        }
        Update: {
          client_record_id?: string
          created_at?: string
          from_number?: string
          id?: string
          message?: string
          order_id?: string | null
          sms_sid?: string
          status?: string
          to_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sms_logs_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order"
            referencedColumns: ["id"]
          },
        ]
      }
      tag: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      test_session: {
        Row: {
          client_record_id: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          client_record_id?: string | null
          created_at: string
          id?: string
          updated_at: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          client_record_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_test_session_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          activation_status: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          is_assistant: boolean | null
          is_owner: boolean | null
          is_practitioner: boolean | null
          last_name: string
          password: string
          pb_consultant_id: string | null
          phone_number: string | null
          role: string | null
          updated_at: string
          user_name: string
        }
        Insert: {
          activation_status?: string | null
          created_at: string
          email: string
          first_name: string
          id?: string
          is_assistant?: boolean | null
          is_owner?: boolean | null
          is_practitioner?: boolean | null
          last_name: string
          password: string
          pb_consultant_id?: string | null
          phone_number?: string | null
          role?: string | null
          updated_at: string
          user_name: string
        }
        Update: {
          activation_status?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_assistant?: boolean | null
          is_owner?: boolean | null
          is_practitioner?: boolean | null
          last_name?: string
          password?: string
          pb_consultant_id?: string | null
          phone_number?: string | null
          role?: string | null
          updated_at?: string
          user_name?: string
        }
        Relationships: []
      }
      virtual_follow_ups: {
        Row: {
          ai_processed: boolean | null
          appetite_suppression: string | null
          client_record_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string
          discontinue_medication: boolean | null
          dose: string | null
          form_id: string | null
          form_request_data: Json | null
          form_request_id: string | null
          goals: string | null
          has_session_note: boolean | null
          id: string
          medication: string | null
          message_to_patient: string | null
          new_dose: string | null
          new_goals: string | null
          new_medication: string | null
          new_plan: string | null
          next_invoice_amount: number | null
          next_payment_date: string
          order_date: string | null
          order_note_id: string | null
          order_placed: boolean | null
          order_placed_temp: boolean | null
          package_id: string | null
          plan_name: string | null
          preferred_plan: string | null
          reviewed_at: string | null
          satisfaction: string | null
          send_review: boolean | null
          service: string | null
          session_id: string | null
          session_note_id: string | null
          side_effects: string | null
          status: string | null
          submit: boolean | null
          trustpilot_status: string | null
          updated_at: string
          user_id: string | null
          vf_interval_history: string | null
          vf_weight_loss_history: string | null
          weight: string | null
        }
        Insert: {
          ai_processed?: boolean | null
          appetite_suppression?: string | null
          client_record_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at: string
          discontinue_medication?: boolean | null
          dose?: string | null
          form_id?: string | null
          form_request_data?: Json | null
          form_request_id?: string | null
          goals?: string | null
          has_session_note?: boolean | null
          id?: string
          medication?: string | null
          message_to_patient?: string | null
          new_dose?: string | null
          new_goals?: string | null
          new_medication?: string | null
          new_plan?: string | null
          next_invoice_amount?: number | null
          next_payment_date: string
          order_date?: string | null
          order_note_id?: string | null
          order_placed?: boolean | null
          order_placed_temp?: boolean | null
          package_id?: string | null
          plan_name?: string | null
          preferred_plan?: string | null
          reviewed_at?: string | null
          satisfaction?: string | null
          send_review?: boolean | null
          service?: string | null
          session_id?: string | null
          session_note_id?: string | null
          side_effects?: string | null
          status?: string | null
          submit?: boolean | null
          trustpilot_status?: string | null
          updated_at: string
          user_id?: string | null
          vf_interval_history?: string | null
          vf_weight_loss_history?: string | null
          weight?: string | null
        }
        Update: {
          ai_processed?: boolean | null
          appetite_suppression?: string | null
          client_record_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          discontinue_medication?: boolean | null
          dose?: string | null
          form_id?: string | null
          form_request_data?: Json | null
          form_request_id?: string | null
          goals?: string | null
          has_session_note?: boolean | null
          id?: string
          medication?: string | null
          message_to_patient?: string | null
          new_dose?: string | null
          new_goals?: string | null
          new_medication?: string | null
          new_plan?: string | null
          next_invoice_amount?: number | null
          next_payment_date?: string
          order_date?: string | null
          order_note_id?: string | null
          order_placed?: boolean | null
          order_placed_temp?: boolean | null
          package_id?: string | null
          plan_name?: string | null
          preferred_plan?: string | null
          reviewed_at?: string | null
          satisfaction?: string | null
          send_review?: boolean | null
          service?: string | null
          session_id?: string | null
          session_note_id?: string | null
          side_effects?: string | null
          status?: string | null
          submit?: boolean | null
          trustpilot_status?: string | null
          updated_at?: string
          user_id?: string | null
          vf_interval_history?: string | null
          vf_weight_loss_history?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_vf_package"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_vf_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

// Supabase Error Types
export type SupabaseError = {
  message: string
  details?: string
  hint?: string
  code?: string
}

export type SupabaseQueryResult<T = any> = {
  data: T | null
  error: string | null
  count?: number | null
  status: number
  statusText: string
}

export type Patient = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  date_of_birth: string | null
  insurance_provider: string | null
  insurance_id: string | null
  status: string | null
  preferred_pharmacy: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}
