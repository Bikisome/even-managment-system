import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { eventsAPI } from "../services/api";
import { Calendar, MapPin, Users, Clock, FileText } from "lucide-react";
import toast from "react-hot-toast";

const CreateEvent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const categories = [
    "conference",
    "workshop",
    "seminar",
    "concert",
    "sports",
    "exhibition",
    "meetup",
    "other",
  ];

  const privacyOptions = [
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
  ];

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await eventsAPI.create(data);
      toast.success("Event created successfully!");
      navigate("/events");
    } catch (error) {
      console.error("Failed to create event:", error);
      const message = error.response?.data?.message || "Failed to create event";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-600">
          Fill in the details below to create your event
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>
          <div className="card-body space-y-4">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Event Title *
              </label>
              <input
                id="title"
                type="text"
                className="input mt-1"
                placeholder="Enter event title"
                {...register("title", {
                  required: "Event title is required",
                  minLength: {
                    value: 3,
                    message: "Title must be at least 3 characters",
                  },
                })}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description *
              </label>
              <textarea
                id="description"
                rows={4}
                className="input mt-1"
                placeholder="Describe your event..."
                {...register("description", {
                  required: "Description is required",
                  minLength: {
                    value: 10,
                    message: "Description must be at least 10 characters",
                  },
                })}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category *
              </label>
              <select
                id="category"
                className="input mt-1"
                {...register("category", {
                  required: "Category is required",
                })}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Date & Time</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date *
                </label>
                <input
                  id="date"
                  type="date"
                  className="input mt-1"
                  {...register("date", {
                    required: "Date is required",
                    validate: (value) => {
                      const selectedDate = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return (
                        selectedDate >= today ||
                        "Date must be today or in the future"
                      );
                    },
                  })}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.date.message}
                  </p>
                )}
              </div>

              {/* Time */}
              <div>
                <label
                  htmlFor="time"
                  className="block text-sm font-medium text-gray-700"
                >
                  Time *
                </label>
                <input
                  id="time"
                  type="time"
                  // step="60" // <-- only allows hour and minute (each minute = 60 seconds)
                  className="input mt-1"
                  {...register("time", {
                    required: "Time is required",
                  })}
                />

                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.time.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Location</h2>
          </div>
          <div className="card-body space-y-4">
            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Location *
              </label>
              <input
                id="location"
                type="text"
                className="input mt-1"
                placeholder="Enter event location"
                {...register("location", {
                  required: "Location is required",
                })}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          </div>
          <div className="card-body space-y-4">
            {/* Privacy */}
            <div>
              <label
                htmlFor="privacy"
                className="block text-sm font-medium text-gray-700"
              >
                Privacy Setting *
              </label>
              <select
                id="privacy"
                className="input mt-1"
                {...register("privacy", {
                  required: "Privacy setting is required",
                })}
              >
                <option value="">Select privacy setting</option>
                {privacyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.privacy && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.privacy.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/events")}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </div>
            ) : (
              "Create Event"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
