import { useState, useEffect, useRef } from "react";
import { X, Upload, Loader2, Plus, Trash2, Link as LinkIcon, Film, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/axios";
import type { IProduct, ICategory } from "@/types";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: IProduct | null;
  onSuccess: () => void;
}

const ProductFormModal = ({ isOpen, onClose, product, onSuccess }: ProductFormModalProps) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    material: "",
    price: "",
    originalPrice: "",
    unit: "",
    category: "",
    description: "",
    stockQuantity: "",
    images: [] as string[],
    isFeatured: false,
    productUrl: "",
    videoUrl: "",
    minOrderQuantity: "",
  });

  const [specsList, setSpecsList] = useState<{key: string, value: string}[]>([]);
  
  // Media states
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/categories");
        setCategories(data.data);
      } catch (err) {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        material: product.material,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || "",
        unit: product.unit,
        category: typeof product.category === 'string' ? product.category : product.category?._id || "",
        description: product.description,
        stockQuantity: product.stockQuantity.toString(),
        images: product.images || [],
        isFeatured: product.isFeatured || false,
        productUrl: product.productUrl || "",
        videoUrl: product.videoUrl || "",
        minOrderQuantity: product.minOrderQuantity || "",
      });
      
      const specsArr = [];
      if (product.specifications) {
        for (const [k, v] of Object.entries(product.specifications)) {
          specsArr.push({ key: k, value: v });
        }
      }
      setSpecsList(specsArr);
    } else {
      setFormData({
        name: "",
        material: "",
        price: "",
        originalPrice: "",
        unit: "",
        category: "",
        description: "",
        stockQuantity: "",
        images: [],
        isFeatured: false,
        productUrl: "",
        videoUrl: "",
        minOrderQuantity: "",
      });
      setSpecsList([
        { key: "Length", value: "" },
        { key: "Usage/Application", value: "" },
        { key: "Material", value: "" },
        { key: "Shape", value: "" },
        { key: "Style", value: "" },
        { key: "Finish", value: "" },
      ]);
    }
    setImageFiles([]);
    setVideoFile(null);
  }, [product, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newList = [...specsList];
    newList[index][field] = value;
    setSpecsList(newList);
  };

  const addSpec = () => {
    setSpecsList([...specsList, { key: "", value: "" }]);
  };

  const removeSpec = (index: number) => {
    setSpecsList(specsList.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const form = new FormData();
    files.forEach(f => form.append("media", f));
    const { data } = await api.post("/upload", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data.data; 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let finalImages = [...formData.images];
      let finalVideoUrl = formData.videoUrl;

      if (imageFiles.length > 0) {
        const uploadedImages = await uploadFiles(imageFiles);
        finalImages = [...finalImages, ...uploadedImages];
      }

      if (videoFile) {
        const uploadedVideo = await uploadFiles([videoFile]);
        if (uploadedVideo.length > 0) {
          finalVideoUrl = uploadedVideo[0];
        }
      }

      const parsedSpecs: Record<string, string> = {};
      specsList.forEach(s => {
        if (s.key.trim() && s.value.trim()) {
          parsedSpecs[s.key.trim()] = s.value.trim();
        }
      });

      const payload = {
        ...formData,
        images: finalImages,
        videoUrl: finalVideoUrl,
        specifications: parsedSpecs,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stockQuantity: Number(formData.stockQuantity),
      };

      if (product) {
        await api.put(`/admin/products/${product._id}`, payload);
        toast.success("Product updated successfully");
      } else {
        await api.post("/admin/products", payload);
        toast.success("Product created successfully");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-brand-dark-lighter w-full max-w-3xl rounded-xl border border-brand-dark-border shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-brand-dark-border sticky top-0 bg-brand-dark-lighter z-10">
          <h2 className="text-xl font-bold text-white">{product ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-brand-dark transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Product Name *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 bg-brand-dark border border-brand-dark-border rounded-lg text-white focus:outline-none focus:border-brand-gold" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Material *</label>
              <input required type="text" name="material" value={formData.material} onChange={handleChange} className="w-full px-4 py-2 bg-brand-dark border border-brand-dark-border rounded-lg text-white focus:outline-none focus:border-brand-gold" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Price (₹) *</label>
              <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-2 bg-brand-dark border border-brand-dark-border rounded-lg text-white focus:outline-none focus:border-brand-gold" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Original Price (₹)</label>
              <input type="number" step="0.01" name="originalPrice" value={formData.originalPrice} onChange={handleChange} className="w-full px-4 py-2 bg-brand-dark border border-brand-dark-border rounded-lg text-white focus:outline-none focus:border-brand-gold" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Unit (e.g. sq ft, piece) *</label>
              <input required type="text" name="unit" value={formData.unit} onChange={handleChange} className="w-full px-4 py-2 bg-brand-dark border border-brand-dark-border rounded-lg text-white focus:outline-none focus:border-brand-gold" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Stock Quantity *</label>
              <input required type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} className="w-full px-4 py-2 bg-brand-dark border border-brand-dark-border rounded-lg text-white focus:outline-none focus:border-brand-gold" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Category *</label>
              <select required name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 bg-brand-dark border border-brand-dark-border rounded-lg text-white focus:outline-none focus:border-brand-gold">
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2 flex items-center mt-8 gap-3">
              <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-5 h-5 bg-brand-dark border border-brand-dark-border rounded text-brand-gold focus:ring-brand-gold" />
              <label className="text-sm font-medium text-gray-300">Featured Product</label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Product URL</label>
              <input type="url" name="productUrl" value={formData.productUrl} onChange={handleChange} className="w-full px-4 py-2 bg-brand-dark border border-brand-dark-border rounded-lg text-white focus:outline-none focus:border-brand-gold" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Minimum Order Qty</label>
              <input type="text" name="minOrderQuantity" value={formData.minOrderQuantity} onChange={handleChange} className="w-full px-4 py-2 bg-brand-dark border border-brand-dark-border rounded-lg text-white focus:outline-none focus:border-brand-gold" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Description *</label>
            <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-4 py-2 bg-brand-dark border border-brand-dark-border rounded-lg text-white focus:outline-none focus:border-brand-gold"></textarea>
          </div>
          
          {/* Specifications */}
          <div className="space-y-4 border border-brand-dark-border rounded-lg p-4 bg-brand-dark">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Specifications</label>
              <button type="button" onClick={addSpec} className="text-brand-gold flex items-center gap-1 text-sm hover:underline">
                <Plus className="w-4 h-4" /> Add Spec
              </button>
            </div>
            
            <div className="space-y-3">
              {specsList.map((spec, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <input type="text" placeholder="Key (e.g. Length)" value={spec.key} onChange={(e) => handleSpecChange(i, 'key', e.target.value)} className="w-1/3 px-3 py-2 bg-brand-dark-lighter border border-brand-dark-border rounded-lg text-white text-sm focus:border-brand-gold" />
                  <input type="text" placeholder="Value (e.g. 5 inch)" value={spec.value} onChange={(e) => handleSpecChange(i, 'value', e.target.value)} className="flex-1 px-3 py-2 bg-brand-dark-lighter border border-brand-dark-border rounded-lg text-white text-sm focus:border-brand-gold" />
                  <button type="button" onClick={() => removeSpec(i)} className="p-2 text-gray-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {specsList.length === 0 && <p className="text-xs text-gray-500 italic">No specifications added.</p>}
            </div>
          </div>

          {/* Media Links / Uploads */}
          <div className="space-y-6 border border-brand-dark-border rounded-lg p-4 bg-brand-dark">
            <h3 className="text-sm font-medium text-gray-300 border-b border-brand-dark-border pb-2">Media & Attachments</h3>
            
            {/* Images */}
            <div className="space-y-3">
              <label className="text-xs text-gray-400 flex items-center gap-1 uppercase font-semibold"><ImageIcon className="w-3 h-3" /> Images</label>
              <div className="space-y-2">
                <textarea name="images" value={formData.images.join(",\n")} onChange={(e) => setFormData(prev => ({...prev, images: e.target.value.split(",").map(s => s.trim()).filter(Boolean)}))} rows={2} placeholder="Image URLs (comma separated)" className="w-full px-4 py-2 bg-brand-dark-lighter border border-brand-dark-border rounded-lg text-white focus:outline-none focus:border-brand-gold text-sm"></textarea>
                <div className="flex items-center gap-3">
                  <input type="file" multiple accept="image/*" ref={imageInputRef} className="hidden" onChange={(e) => {
                    if (e.target.files) setImageFiles(Array.from(e.target.files));
                  }} />
                  <button type="button" onClick={() => imageInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-brand-dark-lighter border border-brand-dark-border rounded-lg text-gray-300 text-sm hover:text-brand-gold hover:border-brand-gold/50 transition-colors">
                    <Upload className="w-4 h-4" /> 
                    {imageFiles.length > 0 ? `${imageFiles.length} files selected` : 'Upload Local Images'}
                  </button>
                  {imageFiles.length > 0 && <button type="button" onClick={() => setImageFiles([])} className="text-xs text-red-400 hover:underline">Clear</button>}
                </div>
              </div>
            </div>

            {/* Video */}
            <div className="space-y-3 pt-4 border-t border-brand-dark-border">
              <label className="text-xs text-gray-400 flex items-center gap-1 uppercase font-semibold"><Film className="w-3 h-3" /> Video</label>
              <div className="space-y-2">
                <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="Video URL (e.g. YouTube, external MP4)" className="w-full px-4 py-2 bg-brand-dark-lighter border border-brand-dark-border rounded-lg text-white focus:outline-none focus:border-brand-gold text-sm" />
                <div className="flex items-center gap-3">
                  <input type="file" accept="video/mp4,video/webm,video/quicktime" ref={videoInputRef} className="hidden" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setVideoFile(e.target.files[0]);
                  }} />
                  <button type="button" onClick={() => videoInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-brand-dark-lighter border border-brand-dark-border rounded-lg text-gray-300 text-sm hover:text-brand-gold hover:border-brand-gold/50 transition-colors">
                    <Upload className="w-4 h-4" /> 
                    {videoFile ? videoFile.name : 'Upload Local Video'}
                  </button>
                  {videoFile && <button type="button" onClick={() => setVideoFile(null)} className="text-xs text-red-400 hover:underline">Clear</button>}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4 border-t border-brand-dark-border">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-gray-300 bg-brand-dark hover:bg-brand-dark-border rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-medium text-brand-dark bg-brand-gold hover:bg-yellow-500 rounded-lg transition-colors flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {product ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
