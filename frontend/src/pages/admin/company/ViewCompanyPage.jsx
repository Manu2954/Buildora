import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getCompanyById,
  getProductsForCompany,
  removeProductFromCompany,
} from "../../../services/companyService";
import { useAdminAuth } from "../../../context/AdminAuthContext";
import {
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Edit3,
  Trash2,
  PlusCircle,
  Package,
  AlertTriangle,
  ChevronLeft,
} from "lucide-react";
import { Image as ImageIcon, Edit, AlertCircle } from 'lucide-react';


const ViewCompanyPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { token } = useAdminAuth();

  const [company, setCompany] = useState(null);
  const [productsData, setProductsData] = useState({
    companyName: "",
    products: [],
  }); // API returns { companyName, products }
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchCompanyAndProducts = useCallback(async () => {
    if (!token || !companyId) {
      setError("Missing token or company ID.");
      setIsLoadingCompany(false);
      setIsLoadingProducts(false);
      return;
    }

    setIsLoadingCompany(true);
    setIsLoadingProducts(true);
    setError(null);

    try {
      const companyDetails = await getCompanyById(companyId, token);
      setCompany(companyDetails);
    } catch (err) {
      console.error("Failed to fetch company details:", err);
      setError(err.message || "Could not load company details.");
      if (err.status === 404) {
        setError(
          `Company with ID ${companyId} not found. You may need to go back and select a valid company.`
        );
      }
    } finally {
      setIsLoadingCompany(false);
    }

    try {
      const productsResponse = await getProductsForCompany(companyId, token);
      setProductsData(
        productsResponse || {
          companyName: company?.name || "N/A",
          products: [],
        }
      ); // Ensure products array exists
    } catch (err) {
      console.error("Failed to fetch products for company:", err);
      // Don't overwrite company error if products fail
      if (!error)
        setError(err.message || "Could not load products for this company.");
    } finally {
      setIsLoadingProducts(false);
    }
  }, [companyId, token, error, company?.name]); // Added company?.name to dependencies to update productsData.companyName

  useEffect(() => {
    fetchCompanyAndProducts();
  }, [fetchCompanyAndProducts]);

  const handleDeleteProductClick = (product) => {
    setProductToDelete(product);
    setShowDeleteProductModal(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete || !companyId || !token) return;
    try {
      await removeProductFromCompany(companyId, productToDelete._id, token);
      setShowDeleteProductModal(false);
      setProductToDelete(null);
      // Refresh products list
      const updatedProductsResponse = await getProductsForCompany(
        companyId,
        token
      );
      setProductsData(
        updatedProductsResponse || {
          companyName: company?.name || "N/A",
          products: [],
        }
      );
    } catch (err) {
      console.error("Failed to delete product:", err);
      setError(err.message || "Could not delete product.");
      setShowDeleteProductModal(false);
    }
  };

  const renderDetailItem = (IconComponent, label, value, isLink = false) => {
    if (!value) return null;
    return (
      <div className="flex items-start py-2">
        <IconComponent
          size={20}
          className="mr-3 text-indigo-500 flex-shrink-0 mt-1"
        />
        <div>
          <span className="block text-sm font-medium text-gray-500">
            {label}
          </span>
          {isLink ? (
            <a
              href={value.startsWith("http") ? value : `https://${value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:underline"
            >
              {value}
            </a>
          ) : (
            <span className="text-sm text-gray-900">{value}</span>
          )}
        </div>
      </div>
    );
  };

  if (isLoadingCompany) {
    return (
      <div className="flex items-center justify-center h-screen">
        <svg
          className="w-12 h-12 text-indigo-600 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="ml-3 text-lg text-gray-700">Loading Company Details...</p>
      </div>
    );
  }

  if (error && !company) {
    // Critical error if company itself cannot be loaded
    return (
      <div className="container px-4 py-8 mx-auto">
        <button
          onClick={() => navigate("/admin/companies")}
          className="mb-6 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ChevronLeft size={18} className="mr-1" /> Back to Companies
        </button>
        <div className="p-8 text-center text-red-700 bg-red-100 border-2 border-red-300 rounded-lg shadow-md">
          <AlertTriangle size={56} className="mx-auto mb-4 text-red-500" />
          <h2 className="mb-2 text-2xl font-semibold">
            Error Loading Company Details
          </h2>
          <p className="mb-6 text-md">{error}</p>
          <button
            onClick={fetchCompanyAndProducts}
            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If company loaded but products error, show company details and product error section
  // General error display for non-critical errors (like product loading failure)
  const generalErrorDisplay =
    error && company ? (
      <div
        className="p-4 my-4 text-sm text-orange-700 bg-orange-100 border border-orange-400 rounded-md"
        role="alert"
      >
        <strong className="font-bold">Notice:</strong>
        <span className="block sm:inline">
          {" "}
          {error} (Company details might be visible, but product data may be
          affected)
        </span>
        <button
          onClick={fetchCompanyAndProducts}
          className="ml-2 text-sm font-semibold text-orange-800 underline"
        >
          Retry fetching all data.
        </button>
      </div>
    ) : null;

  const addressString = company?.address
    ? `${company.address.street || ""}, ${company.address.city || ""}, ${
        company.address.state || ""
      } ${company.address.postalCode || ""}, ${company.address.country || ""}`
        .replace(/, ,/g, ",")
        .replace(/^,|,$/g, "")
        .trim()
    : "Not provided";

  return (
    <div className="container px-4 py-8 mx-auto">
      <button
        onClick={() => navigate("/admin/companies")}
        className="mb-6 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <ChevronLeft size={18} className="mr-1" /> Back to Companies
      </button>

      {generalErrorDisplay}

      {company && (
        <div className="p-6 mb-8 bg-white rounded-lg shadow-xl">
          <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
            <div className="flex items-center">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={`${company.name} logo`}
                  className="w-16 h-16 mr-4 rounded-md object-contain border"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/64x64/e2e8f0/94a3b8?text=Logo";
                  }}
                />
              ) : (
                <div className="flex items-center justify-center w-16 h-16 mr-4 text-indigo-700 bg-indigo-100 rounded-md">
                  <Building size={32} />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {company.name}
                </h1>
                <span
                  className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    company.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {company.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <Link
              to={`/admin/companies/edit/${companyId}`}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Edit3 size={18} className="mr-2" /> Edit Company
            </Link>
          </div>

          {company.description && (
            <p className="mb-6 text-gray-600">{company.description}</p>
          )}

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            {renderDetailItem(Mail, "Contact Email", company.contactEmail)}
            {renderDetailItem(Phone, "Contact Phone", company.contactPhone)}
            {renderDetailItem(Globe, "Website", company.website, true)}
            {renderDetailItem(MapPin, "Address", addressString)}
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Products by{" "}
            {productsData.companyName || company?.name || "this Company"}
          </h2>
          <Link
            to={`/admin/companies/${companyId}/products/add`}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PlusCircle size={18} className="mr-2" /> Add New Product
          </Link>
        </div>

        {isLoadingProducts && (
          <div className="flex items-center justify-center py-10">
            <svg
              className="w-8 h-8 text-indigo-600 animate-spin" /* ... */
            ></svg>
            <p className="ml-2 text-gray-600">Loading products...</p>
          </div>
        )}

        {!isLoadingProducts &&
          productsData.products &&
          productsData.products.length === 0 && (
            <div className="py-10 text-center text-gray-500">
              <Package size={48} className="mx-auto mb-2" />
              <p className="mb-2 text-lg">
                No products found for this company.
              </p>
              <p>You can add products using the "Add New Product" button.</p>
            </div>
          )}

        {!isLoadingProducts &&
          productsData.products &&
          productsData.products.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productsData.products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                          {product.images && product.images[0] ? (
                            <img
                              className="h-10 w-10 rounded-md object-contain"
                              src={product.images[0]}
                              alt={product.name}
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {product.sku || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {product.pricing?.basePrice
                          ? `₹${product.pricing.basePrice.toFixed(2)}`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {product.stock?.quantity ?? "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <Link
                          to={`/admin/companies/${companyId}/products/edit/${product._id}`}
                          className="p-1 text-blue-600 hover:text-blue-900"
                          title="Edit Product"
                        >
                          <Edit3 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDeleteProductClick(product)}
                          className="p-1 ml-2 text-red-600 hover:text-red-900"
                          title="Delete Product"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {/* Delete Product Confirmation Modal */}
      {showDeleteProductModal && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Confirm Product Deletion
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              Are you sure you want to delete the product "
              <strong>{productToDelete.name}</strong>" from{" "}
              <strong>{company?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteProductModal(false);
                  setProductToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCompanyPage;
