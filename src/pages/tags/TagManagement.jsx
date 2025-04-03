import React, { useMemo, useState } from "react";
import { Plus, Edit, Trash2, Search, X, Info, Loader } from "lucide-react";
import Tag from "../common/Tag";
import {
  useTags,
  useTagById,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  useTagUsage,
} from "../../apis/tags/hooks";

const TagManagement = () => {
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [currentTag, setCurrentTag] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "gray",
  });

  // Use React Query hooks for tag operations
  const { data: tagsData = [], isLoading, error } = useTags();
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();

  // Get tag usage data when needed
  const { data: usageData, isLoading: isLoadingUsage } = useTagUsage(
    showUsageModal && currentTag ? currentTag.id : null
  );

  const tags = useMemo(() => {
    return tagsData?.data ?? [];
  }, [tagsData?.data]);

  // Tag colors available in the system
  const tagColors = [
    { name: "Gray", value: "gray" },
    { name: "Red", value: "red" },
    { name: "Yellow", value: "yellow" },
    { name: "Green", value: "green" },
    { name: "Blue", value: "blue" },
    { name: "Indigo", value: "indigo" },
    { name: "Purple", value: "purple" },
    { name: "Pink", value: "pink" },
  ];

  // Handle opening tag creation modal
  const handleAddTag = () => {
    setFormData({
      name: "",
      color: "gray",
    });
    setShowAddModal(true);
  };

  // Handle opening tag edit modal
  const handleEditTag = (tag) => {
    setCurrentTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color,
    });
    setShowEditModal(true);
  };

  // Handle opening tag delete confirmation modal
  const handleDeleteTagConfirmation = (tag) => {
    setCurrentTag(tag);
    setShowDeleteModal(true);
  };

  // Handle opening tag usage modal
  const handleShowUsage = (tag) => {
    setCurrentTag(tag);
    setShowUsageModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle color selection
  const handleColorSelection = (color) => {
    setFormData({
      ...formData,
      color,
    });
  };

  // Handle form submission for creating tags
  const handleCreateTag = () => {
    if (!formData.name.trim()) return;

    createTagMutation.mutate(formData, {
      onSuccess: () => {
        setShowAddModal(false);
      },
    });
  };

  // Handle form submission for updating tags
  const handleUpdateTag = () => {
    if (!formData.name.trim() || !currentTag) return;

    updateTagMutation.mutate(
      { id: currentTag.id, tagData: formData },
      {
        onSuccess: () => {
          setShowEditModal(false);
        },
      }
    );
  };

  // Handle tag deletion
  const handleDeleteTag = () => {
    if (!currentTag) return;

    deleteTagMutation.mutate(currentTag.id, {
      onSuccess: () => {
        setShowDeleteModal(false);
      },
    });
  };

  // Filter tags based on search
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading tags...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline">
          {" "}
          {error.message || "Failed to load tags. Please try again later."}
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tag Management</h1>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
          onClick={handleAddTag}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Tag
        </button>
      </div>

      {/* Search bar */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tags..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tags list */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Available Tags
        </h2>

        {filteredTags.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
              >
                <div className="flex items-center">
                  <Tag id={tag.id} name={tag.name} color={tag.color} />
                  {/* <button
                    className="ml-2 text-gray-400 hover:text-gray-600"
                    onClick={() => handleShowUsage(tag)}
                  >
                    <Info className="h-4 w-4" />
                  </button> */}
                </div>
                <div className="flex space-x-2">
                  <button
                    className="text-indigo-600 hover:text-indigo-900"
                    onClick={() => handleEditTag(tag)}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDeleteTagConfirmation(tag)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No tags found matching your search.
          </div>
        )}
      </div>

      {/* Add Tag Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Add New Tag</h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowAddModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag Name *
                </label>
                <input
                  type="text"
                  name="name"
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {tagColors.map((colorOption) => (
                    <div
                      key={colorOption.value}
                      className={`flex items-center p-2 rounded cursor-pointer border ${
                        formData.color === colorOption.value
                          ? "ring-2 ring-indigo-500 border-indigo-500"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => handleColorSelection(colorOption.value)}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-${colorOption.value}-100`}
                      ></div>
                      <span className="ml-2 text-xs capitalize">
                        {colorOption.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-400"
                    onClick={handleCreateTag}
                    disabled={
                      !formData.name.trim() || createTagMutation.isPending
                    }
                  >
                    {createTagMutation.isPending ? (
                      <>
                        <Loader className="animate-spin h-4 w-4 mr-2 inline" />
                        Creating...
                      </>
                    ) : (
                      "Add Tag"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tag Modal */}
      {showEditModal && currentTag && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Edit Tag</h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowEditModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag Name *
                </label>
                <input
                  type="text"
                  name="name"
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {tagColors.map((colorOption) => (
                    <div
                      key={colorOption.value}
                      className={`flex items-center p-2 rounded cursor-pointer border ${
                        formData.color === colorOption.value
                          ? "ring-2 ring-indigo-500 border-indigo-500"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => handleColorSelection(colorOption.value)}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-${colorOption.value}-100`}
                      ></div>
                      <span className="ml-2 text-xs capitalize">
                        {colorOption.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-400"
                    onClick={handleUpdateTag}
                    disabled={
                      !formData.name.trim() || updateTagMutation.isPending
                    }
                  >
                    {updateTagMutation.isPending ? (
                      <>
                        <Loader className="animate-spin h-4 w-4 mr-2 inline" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Tag Confirmation Modal */}
      {showDeleteModal && currentTag && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Delete Tag</h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowDeleteModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="mb-4">
                Are you sure you want to delete the tag "
                <span className="font-medium">{currentTag.name}</span>"? This
                action cannot be undone.
              </p>

              <p className="text-sm text-gray-500 mb-6">
                This tag will be removed from all associated items.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:bg-red-300"
                  onClick={handleDeleteTag}
                  disabled={deleteTagMutation.isPending}
                >
                  {deleteTagMutation.isPending ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2 inline" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tag Usage Modal */}
      {showUsageModal && currentTag && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Tag Usage</h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowUsageModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 flex items-center">
                <Tag name={currentTag.name} color={currentTag.color} />
              </div>

              {isLoadingUsage ? (
                <div className="py-8 flex justify-center items-center">
                  <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
                  <span className="ml-2 text-gray-600">
                    Loading usage data...
                  </span>
                </div>
              ) : (
                <>
                  {usageData ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 mb-2">
                        This tag is used in the following items:
                      </p>
                      {Object.entries(usageData.usage || {}).map(
                        ([entityType, count]) => (
                          <div
                            key={entityType}
                            className="flex justify-between items-center border-b border-gray-200 pb-2"
                          >
                            <span className="text-sm capitalize">
                              {entityType.replace("_", " ")}
                            </span>
                            <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                              {count}
                            </span>
                          </div>
                        )
                      )}

                      <div className="flex justify-between items-center pt-2 font-medium">
                        <span>Total</span>
                        <span>
                          {Object.values(usageData.usage || {}).reduce(
                            (sum, count) => sum + count,
                            0
                          )}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      No usage data available for this tag.
                    </p>
                  )}
                </>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                  onClick={() => setShowUsageModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManagement;
