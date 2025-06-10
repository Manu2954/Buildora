import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProducts, getFilterOptions } from '../services/storefrontService';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { Search, X, ListFilter, AlertTriangle, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { Helmet } from "react-helmet";

// Reusable component for a collapsible filter section with better styling
const FilterSection = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="py-5 border-b border-gray-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full text-left"
            >
                <span className="text-base font-semibold text-gray-800">{title}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                 <div className="space-y-3">{children}</div>
            </div>
        </div>
    );
};

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [filterOptions, setFilterOptions] = useState({ categories: [], companies: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Memoize filters from URL to avoid re-renders and keep UI in sync
    const activeFilters = useMemo(() => ({
        search: searchParams.get('search') || '',
        sort: searchParams.get('sort') || 'latest',
        categories: searchParams.getAll('categories'),
        companies: searchParams.getAll('companies'),
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
    }), [searchParams]);

    // Fetch products and filter options
    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            setError('');
            try {
                const params = Object.fromEntries(searchParams.entries());
                const [productData, filtersData] = await Promise.all([
                    getProducts(params),
                    getFilterOptions()
                ]);
                setProducts(productData.data || []);
                setPagination(productData.pagination || {});
                setFilterOptions(filtersData || { categories: [], companies: [] });
            } catch (err) {
                setError(err.message || 'Failed to load data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, [searchParams]);

    const handleFilterChange = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('page');

        if (key === 'categories' || key === 'companies') {
            const currentValues = newParams.getAll(key);
            if (currentValues.includes(value)) {
                const updatedValues = currentValues.filter(v => v !== value);
                newParams.delete(key);
                updatedValues.forEach(v => newParams.append(key, v));
            } else {
                newParams.append(key, value);
            }
        } else {
            if (value) newParams.set(key, value);
            else newParams.delete(key);
        }
        setSearchParams(newParams);
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages || newPage === pagination.currentPage) return;
        handleFilterChange('page', newPage);
    };
    
    const clearFilters = () => setSearchParams({});

    const FilterSidebar = () => (
        <div className="p-6 bg-white rounded-lg shadow-sm h-fit">
            <div className="flex items-center justify-between pb-4 border-b">
                <h2 className="text-lg font-bold text-gray-800 flex items-center"><ListFilter size={20} className="mr-2"/> Filters</h2>
                <button onClick={clearFilters} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">Clear All</button>
            </div>
            <FilterSection title="Search">
                 <input type="text" placeholder="Product name..." defaultValue={activeFilters.search} onBlur={(e) => handleFilterChange('search', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </FilterSection>
           {filterOptions.categories && <FilterSection title="Categories">
                {filterOptions.categories.map(category => (
                    <label key={category} className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={activeFilters.categories.includes(category)} onChange={() => handleFilterChange('categories', category)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
                    <span className="text-gray-700">{category}</span></label>
                ))}
            </FilterSection>}
            <FilterSection title="Companies">
                 {filterOptions.companies.map(company => (
                    <label key={company._id} className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={activeFilters.companies.includes(company._id)} onChange={() => handleFilterChange('companies', company._id)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
                    <span className="text-gray-700">{company.name}</span></label>
                ))}
            </FilterSection>
             <FilterSection title="Price Range">
                <div className="flex items-center space-x-2">
                    <input type="number" placeholder="Min" defaultValue={activeFilters.minPrice} onBlur={(e) => handleFilterChange('minPrice', e.target.value)} className="w-full px-2 py-1 text-sm border-gray-300 rounded-md"/>
                    <span className="text-gray-500">-</span>
                    <input type="number" placeholder="Max" defaultValue={activeFilters.maxPrice} onBlur={(e) => handleFilterChange('maxPrice', e.target.value)} className="w-full px-2 py-1 text-sm border-gray-300 rounded-md"/>
                </div>
            </FilterSection>
        </div>
    );

    return (
        <>
        <Helmet>
        <title>Products - Buildora</title>
      </Helmet>
        <div className="min-h-screen bg-white">
            <header className="py-12 bg-gray-50 border-b">
                <div className="container px-4 mx-auto text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Buildora Marketplace</h1>
                    <p className="max-w-2xl mx-auto mt-4 text-xl text-gray-600">
                        Sourcing Made Simple. Building Made Easy.
                    </p>
                </div>
            </header>

            <div className="container px-4 py-12 mx-auto">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                    {/* Filter Sidebar (Desktop) */}
                    <aside className="hidden lg:block lg:col-span-1">
                        <FilterSidebar />
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3">
                         <div className="flex flex-col items-center justify-between gap-4 p-4 mb-6 bg-white border border-gray-200 rounded-lg sm:flex-row">
                            <button onClick={() => setMobileFiltersOpen(true)} className="flex items-center w-full gap-2 px-4 py-2 font-semibold text-gray-700 bg-white border border-gray-300 rounded-md sm:w-auto lg:hidden">
                                <SlidersHorizontal size={18}/> Show Filters
                            </button>
                             <p className="text-sm text-gray-700">
                                 Showing <span className="font-bold">{products.length}</span> of <span className="font-bold">{pagination.totalProducts ?? 0}</span> products
                            </p>
                            <div className="flex items-center space-x-2">
                                <label htmlFor="sort" className="text-sm font-medium text-gray-700">Sort by:</label>
                                <select id="sort" value={activeFilters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)} className="py-2 pl-3 pr-8 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="latest">Latest</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="name-asc">Name: A-Z</option>
                                </select>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                            </div>
                        ) : error ? (
                             <div className="flex flex-col items-center justify-center h-96 text-center text-red-700 bg-red-50 rounded-lg"><AlertTriangle size={48} className="mb-4" /><h3 className="text-xl font-semibold">An Error Occurred</h3><p>{error}</p></div>
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-96 text-center text-gray-500 bg-gray-50 rounded-lg"><Search size={48} className="mb-4" /><h3 className="text-xl font-semibold">No Products Found</h3><p className="max-w-xs mx-auto">Try adjusting your search or filters.</p><button onClick={clearFilters} className="px-4 py-2 mt-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Clear All Filters</button></div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                    {products.map(product => <ProductCard key={product._id} product={product} />)}
                                </div>
                                {/* Pagination */}
                                <nav className="flex items-center justify-center mt-10">
                                     <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="px-3 py-1 mx-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
                                     {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                                         <button key={page} onClick={() => handlePageChange(page)} className={`w-8 h-8 mx-1 text-sm font-medium border rounded-md ${pagination.currentPage === page ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{page}</button>
                                    ))}
                                    <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="px-3 py-1 mx-1 text-sm font-medium text-gray-700 bg-white border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                                </nav>
                            </>
                        )}
                    </main>
                </div>
            </div>
            
            {/* Mobile Filter Overlay */}
            {mobileFiltersOpen && (
                 <div className="fixed inset-0 z-40 flex lg:hidden">
                    <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileFiltersOpen(false)}></div>
                    <div className="relative flex flex-col w-full max-w-xs p-4 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Filters</h2>
                            <button onClick={() => setMobileFiltersOpen(false)}><X className="w-6 h-6"/></button>
                        </div>
                        <div className="overflow-y-auto">
                            <FilterSidebar />
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default ProductsPage;
