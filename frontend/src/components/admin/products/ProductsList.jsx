
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';

// =================================================================================================
// File: src/components/admin/product/ProductList.jsx
// =================================================================================================
// This component renders the list of products in a table.
// It receives the product list and callback functions for edit/delete actions.
// =================================================================================================

const ProductList = ({ products, onEdit, onDelete }) => {
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-10 bg-surface rounded-lg shadow">
                <p className="text-muted">No products found for this company.</p>
                <p className="text-muted text-sm mt-2">Click "Add New Product" to get started.</p>
            </div>
        );
    }

    return (
        <div className="bg-surface shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Product Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Category</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">SKU</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Base Price</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Stock</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-border">
                        {products.map((product) => (
                            <tr key={product._id} className="hover:bg-background">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-text">{product.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-muted">{product.category}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-muted">{product.sku || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-text">₹{product.pricing?.basePrice.toLocaleString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-text">{product.stock?.quantity.toLocaleString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                                        {product.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onEdit(product)} className="text-primary hover:text-primary-hover mr-4 transition duration-150 ease-in-out"><Edit size={18} /></button>
                                    <button onClick={() => onDelete(product)} className="text-error hover:text-error/80 transition duration-150 ease-in-out"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductList;