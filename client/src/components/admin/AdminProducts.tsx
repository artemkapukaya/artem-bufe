import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit2, X, Save, Package, Search, Tag, FolderPlus, Image as ImageIcon, Settings } from "lucide-react";
import { toast } from "sonner";
import { categories as staticCategories } from "@/lib/data";

export interface OptionItem {
  id: string;
  label: string;
  emoji: string;
  priceModifier?: number;
  isDefault?: boolean;
}

interface OptionGroup {
  id: string;
  name: string;
  type: "single" | "multi" | "remove";
  required?: boolean;
  items: OptionItem[];
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  optionGroups?: OptionGroup[];
  orderCount?: number;
}

interface CategoryOverride {
  id: string;
  name: string;
  image: string;
  icon: string;
  isCustom: boolean;
  count: number;
}

const PRODUCTS_KEY   = "artem_custom_products";
const CATEGORIES_KEY = "artem_category_overrides"; // hem sistem hem özel

const emptyForm: Omit<Product, "id"> = {
  name: "", description: "", price: 0, image: "", category: "cig-urunler", hasOptions: false, optionGroups: [],
};

const emptyCatForm = { name: "", icon: "🍽️", image: "" };

export default function AdminProducts() {
  const [activeTab, setActiveTab]         = useState<"products" | "categories">("products");
  const [showOptionEditor, setShowOptionEditor] = useState(false);
  const [editingGroup, setEditingGroup]   = useState<any>(null);
  const [newGroupName, setNewGroupName]   = useState("");
  const [newGroupType, setNewGroupType]   = useState<"single"|"multi"|"remove">("single");
  const [newItemLabel, setNewItemLabel]   = useState("");
  const [newItemEmoji, setNewItemEmoji]   = useState("🍽️");
  const [newItemPrice, setNewItemPrice]   = useState(0);
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [categoryOverrides, setCategoryOverrides] = useState<Record<string, Partial<CategoryOverride>>>({});
  const [customCategoryIds, setCustomCategoryIds] = useState<string[]>([]);

  const [showForm, setShowForm]           = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm]                   = useState<Omit<Product, "id">>(emptyForm);
  const [searchQuery, setSearchQuery]     = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [imagePreview, setImagePreview]   = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCatForm, setShowCatForm]     = useState(false);
  const [editingCatId, setEditingCatId]   = useState<string | null>(null);
  const [catForm, setCatForm]             = useState(emptyCatForm);
  const [catImagePreview, setCatImagePreview] = useState("");
  const catFileInputRef = useRef<HTMLInputElement>(null);

  // Tüm kategoriler — sistem + özel, override'larla birleştirilmiş
  const allCategories: CategoryOverride[] = [
    ...staticCategories.map(sc => ({
      id: sc.id,
      name: categoryOverrides[sc.id]?.name ?? sc.name,
      image: categoryOverrides[sc.id]?.image ?? sc.image,
      icon: categoryOverrides[sc.id]?.icon ?? sc.icon,
      count: sc.count,
      isCustom: false,
    })),
    ...customCategoryIds.map(id => ({
      id,
      name: categoryOverrides[id]?.name ?? id,
      image: categoryOverrides[id]?.image ?? "",
      icon: categoryOverrides[id]?.icon ?? "🍽️",
      count: categoryOverrides[id]?.count ?? 0,
      isCustom: true,
    })),
  ];

  useEffect(() => {
    const p = localStorage.getItem(PRODUCTS_KEY);
    if (p) try { setCustomProducts(JSON.parse(p)); } catch {}
    const c = localStorage.getItem(CATEGORIES_KEY);
    if (c) try {
      const parsed = JSON.parse(c);
      setCategoryOverrides(parsed.overrides ?? {});
      setCustomCategoryIds(parsed.customIds ?? []);
    } catch {}
  }, []);

  const saveProducts = (products: Product[]) => {
    setCustomProducts(products);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event("artem_products_updated"));
  };

  const saveCategoryData = (overrides: Record<string, Partial<CategoryOverride>>, customIds: string[]) => {
    setCategoryOverrides(overrides);
    setCustomCategoryIds(customIds);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify({ overrides, customIds }));
    window.dispatchEvent(new Event("artem_products_updated"));
  };

  // Resim yükleme — base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "product" | "category") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast.error("Resim 3MB'dan küçük olmalı!"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (type === "product") {
        setForm(f => ({ ...f, image: base64 }));
        setImagePreview(base64);
      } else {
        setCatForm(f => ({ ...f, image: base64 }));
        setCatImagePreview(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Kategori düzenlemeyi aç
  const openEditCategory = (cat: CategoryOverride) => {
    setEditingCatId(cat.id);
    setCatForm({ name: cat.name, icon: cat.icon, image: "" });
    setCatImagePreview(cat.image || "");
    setShowCatForm(true);
  };

  // Yeni özel kategori ekle veya mevcut güncelle
  const handleSaveCategory = () => {
    if (!catForm.name.trim()) { toast.error("Kategori adı zorunlu!"); return; }

    const newOverrides = { ...categoryOverrides };
    let newCustomIds = [...customCategoryIds];

    if (editingCatId) {
      // Güncelle
      newOverrides[editingCatId] = {
        ...newOverrides[editingCatId],
        name: catForm.name.toUpperCase(),
        icon: catForm.icon,
        ...(catForm.image ? { image: catForm.image } : {}),
      };
    } else {
      // Yeni ekle
      const id = `custom-${catForm.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}-${Date.now()}`;
      newCustomIds.push(id);
      newOverrides[id] = {
        name: catForm.name.toUpperCase(),
        icon: catForm.icon,
        image: catForm.image || "",
        isCustom: true,
        count: 0,
      };
    }

    saveCategoryData(newOverrides, newCustomIds);
    toast.success(editingCatId ? "Kategori güncellendi!" : "Kategori eklendi!");
    setShowCatForm(false);
    setEditingCatId(null);
    setCatForm(emptyCatForm);
    setCatImagePreview("");
  };

  const handleDeleteCategory = (id: string) => {
    if (!window.confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;
    const newOverrides = { ...categoryOverrides };
    delete newOverrides[id];
    const newCustomIds = customCategoryIds.filter(c => c !== id);
    saveCategoryData(newOverrides, newCustomIds);
    toast.success("Kategori silindi!");
  };

  // Ürün işlemleri
  const handleSubmit = () => {
    if (!form.name.trim())           { toast.error("Ürün adı zorunlu!"); return; }
    if (!form.price || form.price <= 0) { toast.error("Geçerli fiyat girin!"); return; }
    if (!form.category)               { toast.error("Kategori seçin!"); return; }
    if (editingProduct) {
      saveProducts(customProducts.map(p => p.id === editingProduct.id ? { ...form, id: editingProduct.id } : p));
      toast.success("Ürün güncellendi!");
    } else {
      saveProducts([...customProducts, { ...form, id: `custom-${Date.now()}` }]);
      toast.success("Ürün eklendi! Ana sayfada görünecek.");
    }
    setShowForm(false); setEditingProduct(null); setForm(emptyForm); setImagePreview("");
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({ name: product.name, description: product.description, price: product.price,
              image: product.image, category: product.category, hasOptions: product.hasOptions });
    setImagePreview(product.image || "");
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    saveProducts(customProducts.filter(p => p.id !== id));
    toast.success("Ürün silindi!");
  };

  const filteredProducts = customProducts.filter(p => {
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === "all" || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  // CategoryForm inline'a taşındı — focus sorunu düzeltildi

  return (
    <div className="space-y-6">

      {/* Seçenek Grubu Editörü Modal */}
      {showOptionEditor && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-purple-600 px-6 py-4 flex items-center justify-between">
              <h3 className="font-black text-white text-lg">{editingGroup ? "Grubu Düzenle" : "Yeni Seçenek Grubu"}</h3>
              <button onClick={() => { setShowOptionEditor(false); setEditingGroup(null); }} className="text-white/70 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {!editingGroup ? (
                <>
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">Grup Adı</label>
                    <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)}
                      placeholder="örn: Garnitür Seçimi, Sos Seçimi"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1.5">Tip</label>
                    <div className="flex gap-2">
                      {[{v:"single",l:"Tek Seçim"},{v:"multi",l:"Çoklu"},{v:"remove",l:"Çıkar"}].map(({v,l}) => (
                        <button key={v} type="button" onClick={() => setNewGroupType(v as any)}
                          className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${newGroupType === v ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-600"}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => {
                    if (!newGroupName.trim()) return;
                    const newGroup: OptionGroup = { id: `g-${Date.now()}`, name: newGroupName, type: newGroupType, items: [] };
                    setForm(p => ({ ...p, optionGroups: [...(p.optionGroups||[]), newGroup] }));
                    setEditingGroup(newGroup);
                    setNewGroupName(""); 
                  }} className="w-full py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700">
                    Grubu Oluştur →
                  </button>
                </>
              ) : (
                <>
                  <h4 className="font-black text-gray-800">{editingGroup.name} — Seçenekleri Ekle</h4>
                  <div className="flex gap-2">
                    <input value={newItemEmoji} onChange={e => setNewItemEmoji(e.target.value)}
                      className="w-16 px-3 py-2.5 border-2 border-gray-200 rounded-xl text-2xl text-center focus:outline-none focus:border-purple-500" placeholder="🍅" />
                    <input value={newItemLabel} onChange={e => setNewItemLabel(e.target.value)}
                      placeholder="Seçenek adı (örn: Domates)" onKeyDown={e => e.key === "Enter" && (() => {
                        if (!newItemLabel.trim()) return;
                        const newItem: OptionItem = { id: `i-${Date.now()}`, label: newItemLabel, emoji: newItemEmoji, priceModifier: newItemPrice * 100 };
                        setForm(p => ({...p, optionGroups: (p.optionGroups||[]).map(g => g.id === editingGroup.id ? {...g, items: [...g.items, newItem]} : g)}));
                        setEditingGroup(prev => prev ? {...prev, items: [...prev.items, newItem]} : null);
                        setNewItemLabel(""); setNewItemEmoji("🍽️"); setNewItemPrice(0);
                      })()}
                      className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-semibold" />
                    <input type="number" value={newItemPrice} onChange={e => setNewItemPrice(Number(e.target.value))}
                      placeholder="+₺" className="w-20 px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-semibold" />
                    <button type="button" onClick={() => {
                      if (!newItemLabel.trim()) return;
                      const newItem: OptionItem = { id: `i-${Date.now()}`, label: newItemLabel, emoji: newItemEmoji, priceModifier: newItemPrice * 100 };
                      setForm(p => ({...p, optionGroups: (p.optionGroups||[]).map(g => g.id === editingGroup.id ? {...g, items: [...g.items, newItem]} : g)}));
                      setEditingGroup(prev => prev ? {...prev, items: [...prev.items, newItem]} : null);
                      setNewItemLabel(""); setNewItemEmoji("🍽️"); setNewItemPrice(0);
                    }} className="px-4 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700">+</button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {editingGroup.items.map((item, ii) => (
                      <span key={item.id} className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-bold">
                        {item.emoji} {item.label}
                        {item.priceModifier ? <span className="text-orange-600">+{(item.priceModifier/100).toFixed(0)}₺</span> : null}
                        <button type="button" onClick={() => {
                          setForm(p => ({...p, optionGroups: (p.optionGroups||[]).map(g => g.id === editingGroup.id ? {...g, items: g.items.filter((_,i) => i !== ii)} : g)}));
                          setEditingGroup(prev => prev ? {...prev, items: prev.items.filter((_,i) => i !== ii)} : null);
                        }} className="text-red-400 hover:text-red-600 ml-1">✕</button>
                      </span>
                    ))}
                  </div>
                  <button onClick={() => { setShowOptionEditor(false); setEditingGroup(null); }}
                    className="w-full py-2.5 bg-green-600 text-white font-black rounded-xl hover:bg-green-700">
                    ✅ Tamam — Kaydet
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Başlık */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black text-gray-800">Ürün Yönetimi</h1>
          <p className="text-gray-500 text-sm mt-0.5">Eklediğiniz ürünler anında ana sayfada ve menüde görünür</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "categories" ? (
            <button onClick={() => { setShowCatForm(true); setEditingCatId(null); setCatForm(emptyCatForm); setCatImagePreview(""); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg">
              <FolderPlus size={18} /> Kategori Ekle
            </button>
          ) : (
            <button onClick={() => { setShowForm(true); setEditingProduct(null); setForm(emptyForm); setImagePreview(""); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-lg">
              <Plus size={18} /> Yeni Ürün Ekle
            </button>
          )}
        </div>
      </div>

      {/* Tab */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: "products",   label: "Ürünler",    icon: Package },
          { id: "categories", label: "Kategoriler", icon: Tag },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
              activeTab === id ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* ── KATEGORİLER ── */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          {showCatForm && (
            <div className="bg-white rounded-2xl border-2 border-orange-200 shadow-lg overflow-hidden mb-4">
              <div className="flex items-center justify-between px-6 py-4 bg-orange-50 border-b border-orange-100">
                <h2 className="font-black text-gray-800 text-lg">
                  {editingCatId
                    ? `✏️ Kategoriyi Düzenle — ${allCategories.find(c => c.id === editingCatId)?.name ?? ""}`
                    : "➕ Yeni Kategori Ekle"}
                </h2>
                <button onClick={() => { setShowCatForm(false); setEditingCatId(null); setCatForm(emptyCatForm); setCatImagePreview(""); }}
                  className="p-2 hover:bg-orange-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">Kategori Adı *</label>
                  <input
                    type="text"
                    value={catForm.name}
                    onChange={e => setCatForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="örn: Tost Çeşitleri"
                    autoFocus
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">İkon (emoji)</label>
                  <input
                    type="text"
                    value={catForm.icon}
                    onChange={e => setCatForm(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="🍽️"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold text-2xl"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">Kategori Görseli</label>
                  <div onClick={() => catFileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all group">
                    {catImagePreview ? (
                      <div className="relative inline-block">
                        <img src={catImagePreview} alt="Önizleme" className="w-24 h-24 object-cover rounded-xl mx-auto shadow-md" />
                        <button type="button" onClick={e => { e.stopPropagation(); setCatImagePreview(""); setCatForm(f => ({ ...f, image: "" })); if (catFileInputRef.current) catFileInputRef.current.value = ""; }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon size={28} className="mx-auto text-gray-300 mb-2 group-hover:text-orange-400 transition-colors" />
                        <p className="font-bold text-gray-400 text-sm group-hover:text-orange-500">Resim yüklemek için tıklayın</p>
                        <p className="text-xs text-gray-300 mt-1">JPG, PNG, WEBP — Max 3MB</p>
                      </>
                    )}
                    <input ref={catFileInputRef} type="file" accept="image/*"
                      onChange={e => handleImageUpload(e, "category")} className="hidden" />
                  </div>
                </div>
                <div className="sm:col-span-2 flex gap-3 pt-2">
                  <button onClick={handleSaveCategory}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition-colors shadow-md">
                    <Save size={18} /> {editingCatId ? "Değişiklikleri Kaydet" : "Kategori Ekle"}
                  </button>
                  <button onClick={() => { setShowCatForm(false); setEditingCatId(null); setCatForm(emptyCatForm); setCatImagePreview(""); }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                    İptal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tüm kategoriler — hem sistem hem özel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allCategories.map(cat => (
              <div key={cat.id}
                className={`bg-white rounded-xl border-2 p-4 flex items-center gap-3 transition-all hover:shadow-md ${
                  cat.isCustom ? "border-purple-200 hover:border-purple-400" : "border-gray-200 hover:border-orange-300"
                }`}>
                {/* Kategori resmi veya emoji */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{cat.icon || "🍽️"}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-800 text-sm truncate">{cat.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cat.isCustom ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    {cat.isCustom ? "Özel" : "Sistem"}
                  </span>
                </div>

                <div className="flex gap-1.5 shrink-0">
                  {/* Düzenle — hem sistem hem özel için */}
                  <button onClick={() => openEditCategory(cat)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                    title="Düzenle">
                    <Edit2 size={14} />
                  </button>
                  {/* Sil — sadece özel kategoriler */}
                  {cat.isCustom ? (
                    <button onClick={() => handleDeleteCategory(cat.id)}
                      className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                      title="Sil">
                      <Trash2 size={14} />
                    </button>
                  ) : (
                    <div className="p-2 bg-gray-50 text-gray-300 rounded-xl cursor-not-allowed" title="Sistem kategorisi silinemez">
                      <Trash2 size={14} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ÜRÜNLER ── */}
      {activeTab === "products" && (
        <div className="space-y-4">
          {/* Ürün Formu */}
          {showForm && (
            <div className="bg-white rounded-2xl border-2 border-orange-200 shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-orange-50 border-b border-orange-100">
                <h2 className="font-black text-gray-800 text-lg">
                  {editingProduct ? "✏️ Ürünü Düzenle" : "➕ Yeni Ürün Ekle"}
                </h2>
                <button onClick={() => { setShowForm(false); setEditingProduct(null); setForm(emptyForm); setImagePreview(""); }}
                  className="p-2 hover:bg-orange-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">Ürün Adı *</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="örn: Dana Kavurma"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">Açıklama</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Ürün hakkında kısa açıklama..." rows={2}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">Fiyat (TL) *</label>
                  <input type="number" value={form.price || ""} onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                    placeholder="örn: 150" min="0"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold" />
                </div>

                {/* Seçenek Grupları */}
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wide">🎛️ Müşteri Seçenekleri (Garnitür, Sos vb.)</label>
                    <button type="button" onClick={() => { setEditingGroup(null); setShowOptionEditor(true); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700">
                      + Grup Ekle
                    </button>
                  </div>
                  {(form.optionGroups || []).length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">
                      Henüz seçenek grubu yok — müşteriler sipariş verirken seçim yapabilsin
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(form.optionGroups || []).map((group, gi) => (
                        <div key={group.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                          <div className="flex-1">
                            <p className="font-bold text-sm text-gray-800">{group.name} <span className="text-xs text-purple-500">({group.type === "single" ? "Tek" : group.type === "multi" ? "Çoklu" : "Çıkar"})</span></p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {group.items.map(item => (
                                <span key={item.id} className="text-xs bg-white border border-purple-200 px-2 py-0.5 rounded-full">{item.emoji} {item.label}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button type="button" onClick={() => { setEditingGroup(group); setShowOptionEditor(true); }}
                              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Edit2 size={13} /></button>
                            <button type="button" onClick={() => setForm(p => ({...p, optionGroups: (p.optionGroups||[]).filter((_,i) => i !== gi)}))}
                              className="p-1.5 bg-red-50 text-red-500 rounded-lg"><Trash2 size={13} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">Kategori *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold bg-white">
                    {allCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5">Ürün Görseli</label>
                  <div onClick={() => fileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all group">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img src={imagePreview} alt="Önizleme" className="w-32 h-32 object-cover rounded-xl mx-auto shadow-md" />
                        <button type="button" onClick={e => { e.stopPropagation(); setImagePreview(""); setForm(f => ({ ...f, image: "" })); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"><X size={12} /></button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon size={32} className="mx-auto text-gray-300 mb-2 group-hover:text-orange-400 transition-colors" />
                        <p className="font-bold text-gray-400 text-sm group-hover:text-orange-500">Resim yüklemek için tıklayın</p>
                        <p className="text-xs text-gray-300 mt-1">JPG, PNG, WEBP — Max 3MB</p>
                      </>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={e => handleImageUpload(e, "product")} className="hidden" />
                  </div>
                </div>
                <div className="sm:col-span-2 flex gap-3 pt-2">
                  <button onClick={handleSubmit}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition-colors shadow-md">
                    <Save size={18} /> {editingProduct ? "Değişiklikleri Kaydet" : "Ürünü Ekle"}
                  </button>
                  <button onClick={() => { setShowForm(false); setEditingProduct(null); setForm(emptyForm); setImagePreview(""); }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                    İptal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filtre */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Ürün ara..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm font-semibold" />
            </div>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm font-semibold bg-white">
              <option value="all">Tüm Kategoriler</option>
              {allCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>

          {/* Ürün listesi */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
              <Package size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold text-lg">
                {customProducts.length === 0 ? "Henüz ürün eklenmedi" : "Sonuç bulunamadı"}
              </p>
              <p className="text-gray-300 text-sm mt-1">
                {customProducts.length === 0 ? "\"Yeni Ürün Ekle\" butonuyla başlayın" : "Farklı bir arama deneyin"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => {
                const catName = allCategories.find(c => c.id === product.category)?.name ?? product.category;
                return (
                  <div key={product.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:border-orange-300 hover:shadow-md transition-all group">
                    <div className="relative h-40 bg-gray-100 overflow-hidden">
                      <img
                        src={product.image || "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { e.currentTarget.src = "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop"; }}
                      />
                      <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-lg truncate max-w-[120px]">
                        {catName}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-black text-gray-800 mb-1 truncate">{product.name}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-3">{product.description || "Açıklama yok"}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xl text-orange-600">{product.price.toLocaleString("tr-TR")} ₺</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(product)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => handleDelete(product.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {customProducts.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-black text-green-700">{customProducts.length} özel ürün aktif</p>
                <p className="text-xs text-green-600 mt-0.5">Bu ürünler Ana Sayfa ve Menü sayfasında görünüyor</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
