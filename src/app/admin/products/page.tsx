"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@/components/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";
import { Table } from "@/components/ui/Table";
import { FilterBar } from "@/components/ui/FilterBar";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [limit, setLimit] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();
  const { addToast } = useToast();

  const fetchCategories = async () => {
    try {
        const res = await fetch(`${API_URL}/categories`);
        const data = await res.json();
        if (Array.isArray(data)) {
            setCategories(data);
        }
    } catch (e) {
        console.error("Failed to fetch categories", e);
    }
  };

  const fetchBrands = async () => {
    try {
        const res = await fetch(`${API_URL}/brands`);
        const data = await res.json();
        if (Array.isArray(data)) {
            setBrands(data);
        }
    } catch (e) {
        console.error("Failed to fetch brands", e);
    }
  };

  const flattenCategories = (cats: any[], depth = 0): any[] => {
    return cats.reduce((acc, cat) => {
        acc.push({ ...cat, depth });
        if (cat.children && cat.children.length > 0) {
            acc.push(...flattenCategories(cat.children, depth + 1));
        }
        return acc;
    }, []);
  };

  const fetchProducts = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
      });
      
      if (searchQuery) queryParams.append("search", searchQuery);
      if (selectedCategory) queryParams.append("category", selectedCategory);
      if (selectedBrand) queryParams.append("brand", selectedBrand);

      const res = await fetch(`${API_URL}/products?${queryParams.toString()}`);
      const data = await res.json();
      
      if (data.data && Array.isArray(data.data)) {
          setProducts(data.data);
          setMeta(data.meta);
      } else {
          setProducts([]);
          setMeta({ page: 1, totalPages: 1 });
      }
    } catch (e) {
      console.error("Failed to fetch products", e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedBrand, limit]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user || JSON.parse(user).role !== 'admin') {
        router.push("/login");
        return;
    }
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts(1);
    }, 300); // Debounce search

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, selectedCategory, selectedBrand, limit, fetchProducts]);

  useEffect(() => {
      fetchProducts(currentPage);
  }, [currentPage, fetchProducts]);


  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Product deleted", "success");
        fetchProducts(currentPage);
      } else {
        addToast("Failed to delete product", "error");
      }
    } catch (e) {
      addToast("Error deleting product", "error");
    }
  };

  if (loading && products.length === 0) return <FullScreenLoader />;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Products</Heading>
            <p className="text-xs text-slate-500">Manage inventory</p>
        </div>
        <Button onClick={() => router.push("/admin/products/create")} className="rounded-lg shadow-sm py-2 px-4 text-xs h-auto">
            + Add Product
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex-1 w-full">
            <FilterBar onSearch={setSearchQuery} placeholder="Search by name or SKU..." />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto flex-wrap">
              <select 
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-lg focus:ring-sky-500 focus:border-sky-500 block p-2.5 min-w-[150px]"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
              >
                  <option value="">All Categories</option>
                  {flattenCategories(categories).map(cat => (
                      <option key={cat.id} value={cat.id}>
                          {'\u00A0'.repeat(cat.depth * 4)}{cat.name}
                      </option>
                  ))}
              </select>

              <select 
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-lg focus:ring-sky-500 focus:border-sky-500 block p-2.5 min-w-[150px]"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
              >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
              </select>
              
              <select 
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-lg focus:ring-sky-500 focus:border-sky-500 block p-2.5"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
              >
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
              </select>
          </div>
      </div>

      <Table
        data={products}
        onRowClick={(product) => router.push(`/admin/products/${product.id}/edit`)}
        columns={[
          {
            header: "Product",
            cell: (product) => (
                <div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{product.name}</div>
                    {product.sku && <div className="text-[10px] text-slate-400 font-medium">SKU: {product.sku}</div>}
                </div>
            )
          },
          {
            header: "Category",
            cell: (product) => (
                <div className="text-xs text-slate-600 dark:text-slate-400">
                    {categories.find(c => c.id === product.category_id)?.name || 
                     flattenCategories(categories).find(c => c.id === product.category_id)?.name || '-'}
                </div>
            )
          },
          {
            header: "Brand",
            cell: (product) => (
                <div className="text-xs text-slate-600 dark:text-slate-400">
                    {brands.find(b => b.id === product.brand_id)?.name || '-'}
                </div>
            )
          },
          {
            header: "Price",
            cell: (product) => (
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-xs">৳{product.price}</div>
                {product.old_price && <div className="text-[10px] text-slate-400 line-through">৳{product.old_price}</div>}
              </div>
            )
          },
          {
            header: "Stock",
            cell: (product) => (
              <div className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                  product.stock > 10 
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                  : product.stock > 0 
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                  {product.stock}
              </div>
            )
          },
          {
            header: "Status",
            cell: (product) => (
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                    product.is_active 
                    ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                </span>
            )
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (product) => (
              <div className="flex justify-end gap-1">
                  <button 
                  onClick={(e) => { e.stopPropagation(); router.push(`/admin/products/${product.id}/edit`); }}
                  className="p-1.5 rounded text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                  title="Edit"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button 
                  onClick={(e) => handleDelete(product.id, e)}
                  className="p-1.5 rounded text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Delete"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
              </div>
            )
          }
        ]}
        mobileRenderer={(product) => {
            let imageUrl = "https://picsum.photos/seed/product-item/700/700";
            try {
                const parsed = JSON.parse(product.images);
                if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
            } catch (e) {}
            
            return (
                <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">{product.name}</h4>
                                <div className="text-[10px] text-slate-500 mt-0.5">SKU: {product.sku || '-'}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-slate-900 dark:text-white text-xs">৳{product.price}</div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <div className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                product.stock > 10 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : 'bg-red-50 text-red-600'
                            }`}>
                                {product.stock} left
                            </div>
                            <div className="flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); router.push(`/admin/products/${product.id}/edit`); }} className="text-sky-600 text-[10px] font-bold">Edit</button>
                                <button onClick={(e) => handleDelete(product.id, e)} className="text-red-600 text-[10px] font-bold">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }}
      />
      
      {/* Pagination */}
      <div className="flex justify-between items-center pt-2">
          <Button 
              variant="outline" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="rounded-lg py-1.5 px-3 text-xs h-auto"
          >
              Previous
          </Button>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Page {meta.page} of {meta.totalPages}
          </span>
          <Button 
              variant="outline" 
              disabled={currentPage === meta.totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="rounded-lg py-1.5 px-3 text-xs h-auto"
          >
              Next
          </Button>
      </div>
    </div>
  );
}
