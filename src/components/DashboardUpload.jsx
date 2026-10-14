import React from "react";
import { Upload, X, File } from "lucide-react";

const DashboardUpload = ({
  files,
  onFileChange,
  onUpload,
  uploading,
  onRemoveFile,
  remainingUploads,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">

      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Upload Files
      </h2>

      {/* File Input */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition">
        <Upload className="mx-auto text-gray-400" size={32} />
        <p className="text-gray-600 text-sm mt-2 mb-1">
          Drag and drop files here, or click below
        </p>

        <label className="cursor-pointer inline-block mt-3">
          <span className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition">
            Select Files
          </span>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={onFileChange}
          />
        </label>

        <p className="text-xs text-gray-500 mt-3">
          Remaining uploads allowed:{" "}
          <span className="font-semibold text-gray-700">{remainingUploads}</span>
        </p>
      </div>

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Selected Files
          </h3>

          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <File className="text-gray-500" size={18} />
                  <p className="text-gray-700 text-sm truncate max-w-[180px]">
                    {file.name}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => onRemoveFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={onUpload}
        disabled={uploading}
        className={`w-full mt-6 py-2 rounded-md text-white font-medium transition 
        ${uploading ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"}`}
      >
        {uploading ? "Uploading..." : "Upload Files"}
      </button>
    </div>
  );
};

export default DashboardUpload;
