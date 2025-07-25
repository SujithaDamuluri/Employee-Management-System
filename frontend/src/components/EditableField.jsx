
import React, { useState } from "react";

const EditableField = ({ label, value, onSave, type = "text" }) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleSave = () => {
    onSave(inputValue);
    setEditing(false);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      {editing ? (
        <div className="flex gap-2 items-center">
          <input
            type={type}
            className="p-2 border rounded-md w-full dark:bg-gray-800 dark:text-white"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            onClick={handleSave}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={() => {
              setInputValue(value);
              setEditing(false);
            }}
            className="px-3 py-1 text-sm bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <p className="text-gray-800 dark:text-white">{value}</p>
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default EditableField;