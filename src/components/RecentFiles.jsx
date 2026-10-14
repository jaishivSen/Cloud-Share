import React from "react";
import { File, Calendar, Share2, Download } from "lucide-react";

const RecentFiles = ({ files }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Files</h2>

      {files.length === 0 ? (
        <p className="text-gray-500 text-sm">No recent files found.</p>
      ) : (
        <div className="space-y-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
            >
              {/* Left Section */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <File size={20} className="text-blue-600" />
                </div>

                <div>
                  <p className="text-gray-800 font-medium truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Right Buttons */}
              <div className="flex gap-2">
                <a
                  href={file.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-sm bg-gray-800 text-white rounded-md hover:bg-black flex items-center gap-1"
                >
                  <Download size={14} /> Download
                </a>

                <a
                  href={`/file/${file.id}`}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                >
                  <Share2 size={14} /> View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentFiles;
