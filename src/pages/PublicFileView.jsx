import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiEndpoints } from '../util/apiEndpoints';
import toast from 'react-hot-toast';
import { Copy, Download, Info, Share2, File } from 'lucide-react';
import LinkShareModal from '../components/LinkShareModal';

const PublicFileView = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [shareModal, setShareModal] = useState({
    isOpen: false,
    link: ""
  });

  const { getToken } = useAuth();
  const { fileId } = useParams();

  useEffect(() => {
    const getFile = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(apiEndpoints.PUBLIC_FILE_VIEW(fileId));
        setFile(res.data);
        setError(null);
      } catch (err) {
        setError("Could not retrieve file. The link may be invalid or removed.");
      } finally {
        setIsLoading(false);
      }
    };
    getFile();
  }, [fileId]);

  const handleDownload = async () => {
    try {
      const response = await axios.get(apiEndpoints.DOWNLOAD_FILE(fileId), {
        'responseType': "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Sorry, the file could not be downloaded.");
    }
  };

  const openShareModal = () => {
    setShareModal({
      isOpen: true,
      link: window.location.href,
    });
  };

  const closeShareModal = () => {
    setShareModal({
      isOpen: false,
      link: "",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-gray-600">Loading file...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!file) return null;

  return (
  <div className="min-h-screen bg-[#f7f8fc]">

    {/* ===== HEADER ===== */}
    <header className="w-full border-b bg-white py-4 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4">

        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <Share2 className="text-blue-600" />
          <span className="font-bold text-xl text-gray-800">SkySync</span>
        </div>

        {/* Right: Share Button */}
        <button
          onClick={openShareModal}
          className="flex items-center gap-2 px-4 py-2 border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition"
        >
          <Copy size={18} />
          <span className="font-medium">Share Link</span>
        </button>
      </div>
    </header>

    {/* ===== MAIN CONTENT ===== */}
    <main className="max-w-4xl mx-auto p-6 md:p-12">

      {/* CARD */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md p-10 text-center">

        {/* File Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
            <File size={42} className="text-blue-500" />
          </div>
        </div>

        {/* File Name */}
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
          {file.name}
        </h1>

        {/* Size + Date */}
        <p className="text-gray-500 text-sm mt-2">
          {(file.size / 1024).toFixed(2)} KB
          <span className="mx-2 text-gray-400">•</span>
          Shared on {new Date(file.uploadedAt).toLocaleDateString()}
        </p>

        {/* File Type Tag */}
        <div className="mt-4 mb-6">
          <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full uppercase">
            {file.type || "File"}
          </span>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="flex mx-auto items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition shadow-sm"
        >
          <Download size={18} />
          Download File
        </button>

        {/* Divider */}
        <div className="border-t border-gray-200 my-10"></div>

        {/* ===== FILE INFORMATION ===== */}
        <h3 className="text-lg font-semibold text-left text-gray-800 mb-6">
          File Information
        </h3>

        <div className="text-sm text-gray-600 space-y-4">

          <div className="flex justify-between">
            <span className="text-gray-500">File Name:</span>
            <span className="text-gray-800 font-medium break-all">{file.name}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">File Type:</span>
            <span className="text-gray-800 font-medium">{file.type}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">File Size:</span>
            <span className="text-gray-800 font-medium">
              {(file.size / 1024).toFixed(2)} KB
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Shared:</span>
            <span className="text-gray-800 font-medium">
              {new Date(file.uploadedAt).toLocaleDateString()}
            </span>
          </div>

        </div>
      </div>

      {/* ===== PUBLIC INFO BOX ===== */}
      <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg flex gap-3 items-start">
        <Info size={22} className="mt-0.5" />
        <p className="text-sm">
          This file has been shared publicly. Anyone with this link can view and download it.
        </p>
      </div>
    </main>

    {/* Share Modal */}
    <LinkShareModal
      isOpen={shareModal.isOpen}
      onClose={closeShareModal}
      link={shareModal.link}
      title="Share File"
    />
  </div>
);

}
export default PublicFileView;
