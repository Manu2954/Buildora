import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { getProducts, getFilterOptions, logSearchTerm } from '../services/storefrontService';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { Search, X, ListFilter, AlertTriangle, ChevronDown, ChevronUp, SlidersHorizontal, Package, Tag } from 'lucide-react';

// Custom hook for debouncing input to prevent excessive API calls
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


// The New Advanced Search Bar Component
const AdvancedSearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const navigate = useNavigate();
    const searchRef = useRef(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (debouncedSearchTerm) {
                try {
                    const response = await fetch(`/api/storefront/suggestions?q=${debouncedSearchTerm}`);
                    const data = await response.json();
                    if (data.success) {
                        setSuggestions(data.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch search suggestions:", error);
                }
            } else {
                setSuggestions([]);
            }
        };
        fetchSuggestions();
    }, [debouncedSearchTerm]);
    
    // Close suggestions when clicking outside the search component
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSuggestionsVisible(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchRef]);


    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            logSearchTerm(searchTerm.trim());
            setIsSuggestionsVisible(false);
            navigate(`/products?search=${searchTerm}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto" ref={searchRef}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSuggestionsVisible(true)}
                placeholder="Search for products or categories..."
                className="w-full py-3 pl-12 pr-4 text-gray-900 bg-white border-2 border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {isSuggestionsVisible && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-2 overflow-hidden text-left bg-white border border-gray-200 rounded-lg shadow-lg">
                    <ul className="divide-y divide-gray-100">
                        {suggestions.map((suggestion, index) => {
                            // --- THE FIX IS HERE ---
                            // Conditionally create the correct URL based on suggestion type.
                            const linkUrl = suggestion.type === 'Category' 
                                ? `/products?categories=${suggestion.name}` 
                                : `/products?search=${suggestion.name}`;

                            return (
                                <li key={index}>
                                    <Link 
                                        to={linkUrl} 
                                        className="flex items-center w-full px-4 py-3 transition-colors hover:bg-gray-50"
                                        onClick={() => {
                                            setSearchTerm(suggestion.name);
                                            setIsSuggestionsVisible(false);
                                        }}
                                    >
                                        {suggestion.type === 'Product' ? <Package className="w-5 h-5 mr-3 text-gray-400"/> : <Tag className="w-5 h-5 mr-3 text-gray-400"/>}
                                        <span>{suggestion.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </form>
    );
};


// Reusable component for a collapsible filter section
const FilterSection = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="py-5 border-b border-gray-200">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full text-left">
                <span className="text-base font-semibold text-gray-800">{title}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen mt-4' : 'max-h-0'}`}>
                 <div className="space-y-3">{children}</div>
            </div>
        </div>
    );
};

// --- THIS COMPONENT IS NOW DEFINED OUTSIDE ---
const FilterSidebar = ({ filterOptions, activeFilters, handleFilterChange, clearFilters, localSearchTerm, setLocalSearchTerm }) => (
    <aside className="p-6 bg-white rounded-lg shadow-sm h-fit">
        <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-lg font-bold text-gray-800 flex items-center"><ListFilter size={20} className="mr-2"/> Filters</h2>
            <button onClick={clearFilters} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">Clear All</button>
        </div>
        <FilterSection title="Search">
            <input type="text" placeholder="Product name..." value={localSearchTerm} onChange={(e) => setLocalSearchTerm(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
        </FilterSection>
        <FilterSection title="Categories">
            {(filterOptions.categories || []).map(category => (
                <label key={category} className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={activeFilters.categories.includes(category)} onChange={() => handleFilterChange('categories', category)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
                <span className="text-gray-700">{category}</span></label>
            ))}
        </FilterSection>
        <FilterSection title="Companies">
             {(filterOptions.companies || []).map(company => (
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
    </aside>
);


const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [filterOptions, setFilterOptions] = useState({ categories: [], companies: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    
    const [localSearchTerm, setLocalSearchTerm] = useState(searchParams.get('search') || '');
    const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

    const activeFilters = useMemo(() => ({
        search: searchParams.get('search') || '',
        sort: searchParams.get('sort') || 'latest',
        categories: searchParams.getAll('categories'),
        companies: searchParams.getAll('companies'),
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
    }), [searchParams]);

    useEffect(() => {
        const currentSearchInUrl = searchParams.get('search') || '';
        if (debouncedSearchTerm !== currentSearchInUrl) {
            const newParams = new URLSearchParams(searchParams);
            if (debouncedSearchTerm) {
                newParams.set('search', debouncedSearchTerm);
                logSearchTerm(debouncedSearchTerm);
            } else {
                newParams.delete('search');
            }
            newParams.delete('page');
            setSearchParams(newParams, { replace: true });
        }
    }, [debouncedSearchTerm, searchParams, setSearchParams]);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            setError('');
            try {
                const params = Object.fromEntries(searchParams.entries());
                const [productData, filtersData] = await Promise.all([ getProducts(params), getFilterOptions() ]);
                setProducts(productData.data || []);
                setPagination(productData.pagination || {});
                setFilterOptions(filtersData || { categories: [], companies: [] });
            } catch (err) {
                setError(err.message || 'Failed to load data.');
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
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', newPage.toString());
        setSearchParams(newParams);
    };
    
    const clearFilters = () => {
        setLocalSearchTerm('');
        setSearchParams({});
    };

    return (
        <div className="min-h-screen bg-white">
            <header className="py-12 bg-gray-50 border-b">
                <div className="container px-4 mx-auto text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Buildora Marketplace</h1>
                    <p className="max-w-2xl mx-auto mt-4 text-xl text-gray-600">Sourcing Made Simple. Building Made Easy.</p>
                    <div className="mt-8">
                        <AdvancedSearchBar />
                    </div>
                </div>
            </header>

            <div className="container px-4 py-12 mx-auto">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                    <aside className="hidden lg:block lg:col-span-1">
                        <FilterSidebar {...{ filterOptions, activeFilters, handleFilterChange, clearFilters, localSearchTerm, setLocalSearchTerm }} />
                    </aside>
                    <main className="lg:col-span-3">
                         <div className="flex flex-col items-center justify-between gap-4 p-4 mb-6 bg-white border border-gray-200 rounded-lg sm:flex-row">
                            <button onClick={() => setMobileFiltersOpen(true)} className="flex items-center w-full gap-2 px-4 py-2 font-semibold text-gray-700 bg-white border border-gray-300 rounded-md sm:w-auto lg:hidden"><SlidersHorizontal size={18}/> Show Filters</button>
                             <p className="text-sm text-gray-700">Showing <span className="font-bold">{products.length}</span> of <span className="font-bold">{pagination.totalProducts ?? 0}</span> products</p>
                            <div className="flex items-center space-x-2">
                                <label htmlFor="sort" className="text-sm font-medium text-gray-700">Sort by:</label>
                                <select id="sort" value={activeFilters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)} className="py-2 pl-3 pr-8 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="latest">Latest</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="name-asc">Name: A-Z</option>
                                </select>
                            </div>
                        </div>
                        {isLoading ? ( <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
                        ) : error ? ( <div className="flex flex-col items-center justify-center h-96 text-center text-red-700 bg-red-50 rounded-lg"><AlertTriangle size={48} className="mb-4" /><h3 className="text-xl font-semibold">An Error Occurred</h3><p>{error}</p></div>
                        ) : products.length === 0 ? ( <div className="flex flex-col items-center justify-center h-96 text-center text-gray-500 bg-gray-50 rounded-lg"><Search size={48} className="mb-4" /><h3 className="text-xl font-semibold">No Products Found</h3><p className="max-w-xs mx-auto">Try adjusting your search or filters.</p><button onClick={clearFilters} className="px-4 py-2 mt-4 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Clear All Filters</button></div>
                        ) : ( <>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">{products.map(product => <ProductCard key={product._id} product={product} />)}</div>
                                <nav className="flex items-center justify-center mt-10">
                                     <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={!pagination.currentPage || pagination.currentPage === 1} className="px-3 py-1 mx-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
                                     {Array.from({ length: pagination.totalPages || 0 }, (_, i) => i + 1).map(page => (
                                         <button key={page} onClick={() => handlePageChange(page)} className={`w-8 h-8 mx-1 text-sm font-medium border rounded-md ${pagination.currentPage === page ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{page}</button>
                                    ))}
                                    <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.currentPage || pagination.currentPage === pagination.totalPages} className="px-3 py-1 mx-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                                </nav>
                            </>
                        )}
                    </main>
                </div>
            </div>
            {mobileFiltersOpen && (
                 <div className="fixed inset-0 z-40 flex lg:hidden">
                    <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileFiltersOpen(false)}></div>
                    <div className="relative flex flex-col w-full max-w-xs p-4 bg-white">
                        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">Filters</h2><button onClick={() => setMobileFiltersOpen(false)}><X className="w-6 h-6"/></button></div>
                        <div className="overflow-y-auto">
                            <FilterSidebar {...{ filterOptions, activeFilters, handleFilterChange, clearFilters, localSearchTerm, setLocalSearchTerm }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
