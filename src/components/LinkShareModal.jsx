import React from "react";
import Modal from "./Modal";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const LinkShareModal = ({ isOpen, onClose, link, title = "Share Link" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      confirmText="Close"
      cancelText=""
      onConfirm={onClose}
      confirmationButtonClass="bg-purple-600 hover:bg-purple-700"
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Anyone with this link will be able to view the file.
        </p>

        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md">
          <input
            type="text"
            readOnly
            value={link}
            className="w-full bg-transparent outline-none text-gray-800 text-sm"
          />

          <button
            onClick={handleCopy}
            className="ml-3 text-gray-600 hover:text-gray-900 transition"
          >
            {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LinkShareModal;
