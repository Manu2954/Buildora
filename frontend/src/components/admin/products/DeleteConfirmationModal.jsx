import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, productName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
                <div className="flex items-center">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="ml-4 text-left">
                         <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                            Delete Product
                        </h3>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-sm text-gray-600">
                        Are you sure you want to delete the product "<strong>{productName}</strong>"? This action cannot be undone.
                    </p>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition duration-300"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;