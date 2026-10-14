import React, { useRef } from "react";
import { Upload, X, File as FileIcon } from "lucide-react";

const UploadBox = ({
  files,
  onFileChange,
  onRemoveFile,
  onUpload,
  uploading,
  remainingCredits,
  isUploadDisabled
}) => {
  const fileInputRef = useRef(null);

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const syntheticEvent = { target: { files: droppedFiles } };
    onFileChange(syntheticEvent);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold flex items-center gap-1">
          <Upload size={18} className="text-blue-600" />
          Upload Files
        </h2>

        <span className="text-sm text-gray-600">
          {remainingCredits} credits remaining
        </span>
      </div>

      {/* Drag & Drop Box */}
      <div
        className="w-full border-2 border-dashed border-blue-300 rounded-xl bg-blue-50/20 py-14 flex flex-col items-center justify-center cursor-pointer transition hover:bg-blue-50"
        onClick={handleBrowseClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="p-4 bg-blue-100 rounded-full shadow-sm">
          <Upload size={28} className="text-blue-700" />
        </div>

        <p className="mt-4 text-gray-700 font-medium text-sm">
          Drag and drop files here
        </p>
        <p className="text-xs text-gray-500">
          or click to browse ({remainingCredits} credits remaining)
        </p>

        <input
          type="file"
          ref={fileInputRef}
          multiple
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="mt-6 bg-white border rounded-lg shadow-sm p-4">

          <h3 className="text-sm font-semibold mb-3">
            Selected Files ({files.length})
          </h3>

          <ul className="space-y-3">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex justify-between items-center border-b pb-2"
              >
                <div className="flex items-center gap-3">
                  <FileIcon size={18} className="text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveFile(index)}
                  className="text-gray-500 hover:text-red-500 transition"
                >
                  <X size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <button
          onClick={onUpload}
          disabled={isUploadDisabled || uploading}
          className={`w-full mt-6 py-3 rounded-lg text-white text-center font-medium transition 
          ${isUploadDisabled || uploading
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      )}
    </div>
  );
};

export default UploadBox;
