'use client';

import type { Product } from '@/store/productStore';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createSlug, useProductStore } from '@/store/productStore';
import { useEffect, useState } from 'react';

// Ürün formu için tip tanımı
type ProductFormData = Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>;

// Ürün yönetici uygulaması
export const ProductManager = ({ productId }: { productId?: string }) => {
  // View durumları: list, create, edit, view
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'view'>('list');

  // Store'dan ürünleri ve metodları al
  const { products, addProduct, updateProduct, deleteProduct, getProduct }
    = useProductStore();

  // Düzenlenecek ürün ID'si
  const [currentProductId, setCurrentProductId] = useState<string | undefined>(
    productId,
  );

  // Form durumu
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    shortDescription: '',
    description: '',
    price: 0,
    discountPrice: undefined,
    sku: '',
  });

  // Form hataları
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Eğer ürün ID'si verilmişse, formu doldur
  useEffect(() => {
    if (productId) {
      const product = getProduct(productId);
      if (product) {
        setFormData({
          title: product.title,
          shortDescription: product.shortDescription,
          description: product.description,
          price: product.price,
          discountPrice: product.discountPrice,
          sku: product.sku,
        });

        setView('edit');
        setCurrentProductId(productId);
      }
    }
  }, [productId, getProduct]);

  // Form alanlarını değiştirme işleyicisi
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    // Sayısal değerler için dönüşüm
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? undefined : Number.parseFloat(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Alanın hatasını temizle
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  // Form gönderme işleyicisi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Form doğrulama
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Başlık zorunludur';
    }

    if (!formData.shortDescription.trim()) {
      errors.shortDescription = 'Kısa açıklama zorunludur';
    }

    if (!formData.description.trim()) {
      errors.description = 'Açıklama zorunludur';
    }

    if (formData.price <= 0) {
      errors.price = 'Fiyat sıfırdan büyük olmalıdır';
    }

    if (
      formData.discountPrice !== undefined
      && formData.discountPrice >= formData.price
    ) {
      errors.discountPrice = 'İndirimli fiyat, normal fiyattan düşük olmalıdır';
    }

    if (!formData.sku.trim()) {
      errors.sku = 'SKU zorunludur';
    }

    // Hatalar varsa güncelle ve işlemi durdur
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Yeni ürün oluşturma veya güncelleme
    if (view === 'create') {
      addProduct(formData);
      setView('list');
      resetForm();
    } else if (view === 'edit' && currentProductId) {
      updateProduct(currentProductId, formData);
      setView('list');
      resetForm();
    }
  };

  // Form sıfırlama
  const resetForm = () => {
    setFormData({
      title: '',
      shortDescription: '',
      description: '',
      price: 0,
      discountPrice: undefined,
      sku: '',
    });

    setFormErrors({});
    setCurrentProductId(undefined);
  };

  // Ürünü düzenleme moduna geç
  const handleEdit = (id: string) => {
    const product = getProduct(id);
    if (product) {
      setFormData({
        title: product.title,
        shortDescription: product.shortDescription,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        sku: product.sku,
      });

      setCurrentProductId(id);
      setView('edit');
    }
  };

  // Ürünü görüntüleme moduna geç
  const handleView = (id: string) => {
    setCurrentProductId(id);
    setView('view');
  };

  // Ürünü sil
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  // Simüle edilmiş slug göster
  const previewSlug = formData.title ? createSlug(formData.title) : '';

  // Görünüme göre içeriği render et
  const renderContent = () => {
    // Ürün Listesi
    if (view === 'list') {
      return (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Products</h2>
            <Button onClick={() => setView('create')} variant="secondary">
              New Product
            </Button>
          </div>

          {products.length === 0
            ? (
                <div className="flex items-center justify-center flex-1">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">No products found</p>
                    <Button onClick={() => setView('create')} variant="secondary">
                      Create First Product
                    </Button>
                  </div>
                </div>
              )
            : (
                <div className="flex-1 overflow-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-4 text-left">Title</th>
                        <th className="py-2 px-4 text-left">Price</th>
                        <th className="py-2 px-4 text-left">SKU</th>
                        <th className="py-2 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id} className="border-b hover:bg-muted">
                          <td className="py-2 px-4">{product.title}</td>
                          <td className="py-2 px-4">
                            {product.discountPrice !== undefined
                              ? (
                                  <div>
                                    <span className="line-through text-muted-foreground mr-2">
                                      {product.price.toLocaleString('tr-TR')}
                                      {' '}
                                      TL
                                    </span>
                                    <span className="text-green-600 font-medium">
                                      {product.discountPrice.toLocaleString('tr-TR')}
                                      {' '}
                                      TL
                                    </span>
                                  </div>
                                )
                              : (
                                  <span>
                                    {product.price.toLocaleString('tr-TR')}
                                    {' '}
                                    TL
                                  </span>
                                )}
                          </td>
                          <td className="py-2 px-4">{product.sku}</td>
                          <td className="py-2 px-4 text-right">
                            <Button
                              size="sm"
                              className="mr-2"
                              onClick={() => handleView(product.id)}
                              variant="secondary"
                            >
                              Görüntüle
                            </Button>
                            <Button
                              size="sm"
                              className="mr-2"
                              onClick={() => handleEdit(product.id)}
                              variant="secondary"
                            >
                              Düzenle
                            </Button>
                            <Button
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleDelete(product.id)}
                              variant="secondary"
                            >
                              Sil
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
        </div>
      );
    }

    // Ürün Oluşturma/Düzenleme Formu
    if (view === 'create' || view === 'edit') {
      return (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {view === 'create' ? 'New Product' : 'Edit Product'}
            </h2>
            <Button
              onClick={() => {
                setView('list');
                resetForm();
              }}
              variant="outline"
            >
              Cancel
            </Button>
          </div>

          <div className="flex-1 overflow-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className="mb-2">
                  Başlık
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={formErrors.title ? 'border-red-500' : ''}
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.title}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="slug" className="mb-2">
                  Slug (Otomatik oluşturulur)
                </Label>
                <Input
                  id="slug"
                  value={previewSlug}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Başlığa göre otomatik oluşturulur ve time-stamp eklenir
                </p>
              </div>

              <div>
                <Label htmlFor="sku" className="mb-2">
                  SKU
                </Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className={formErrors.sku ? 'border-red-500' : ''}
                />
                {formErrors.sku && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.sku}</p>
                )}
              </div>

              <div>
                <Label htmlFor="shortDescription" className="mb-2">
                  Kısa Açıklama
                </Label>
                <Textarea
                  id="shortDescription"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows={2}
                  className={
                    formErrors.shortDescription ? 'border-red-500' : ''
                  }
                />
                {formErrors.shortDescription && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.shortDescription}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description" className="mb-2">
                  Açıklama
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className={formErrors.description ? 'border-red-500' : ''}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="mb-2">
                    Fiyat (TL)
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className={formErrors.price ? 'border-red-500' : ''}
                  />
                  {formErrors.price && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.price}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="discountPrice" className="mb-2">
                    İndirimli Fiyat (TL)
                  </Label>
                  <Input
                    id="discountPrice"
                    name="discountPrice"
                    type="number"
                    step="0.01"
                    value={
                      formData.discountPrice === undefined
                        ? ''
                        : formData.discountPrice
                    }
                    onChange={handleChange}
                    className={formErrors.discountPrice ? 'border-red-500' : ''}
                    placeholder="Yoksa boş bırakın"
                  />
                  {formErrors.discountPrice && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.discountPrice}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" variant="outline">
                  {view === 'create' ? 'Create Product' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // Ürün Detayı Görüntüleme
    if (view === 'view' && currentProductId) {
      const product = getProduct(currentProductId);
      if (!product) {
        return <div>Product not found</div>;
      }

      return (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Product Details</h2>
            <div>
              <Button
                className="mr-2"
                onClick={() => handleEdit(currentProductId)}
                variant="outline"
              >
                Düzenle
              </Button>
              <Button onClick={() => setView('list')} variant="outline">
                Listeye Dön
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="bg-muted p-6 rounded-lg">
              <div className="grid md:grid-cols-[2fr_1fr] gap-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                  <p className="text-sm text-muted-foreground mb-4">
                    Slug:
                    {' '}
                    {product.slug}
                  </p>

                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Kısa Açıklama</h3>
                    <p>{product.shortDescription}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Açıklama</h3>
                    <p className="whitespace-pre-line">{product.description}</p>
                  </div>
                </div>

                <div>
                  <div className="bg-card p-4 rounded-md mb-4">
                    <h3 className="text-lg font-medium mb-2">Fiyat Bilgisi</h3>

                    {product.discountPrice !== undefined
                      ? (
                          <div className="mb-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Normal Fiyat:
                              </span>
                              <span className="line-through">
                                {product.price.toLocaleString('tr-TR')}
                                {' '}
                                TL
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">İndirimli Fiyat:</span>
                              <span className="text-green-600 font-bold">
                                {product.discountPrice.toLocaleString('tr-TR')}
                                {' '}
                                TL
                              </span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-sm">İndirim Miktarı:</span>
                              <span className="text-sm text-green-600">
                                %
                                {Math.round(
                                  ((product.price - product.discountPrice)
                                    / product.price)
                                  * 100,
                                )}
                              </span>
                            </div>
                          </div>
                        )
                      : (
                          <div className="flex justify-between mb-2">
                            <span>Fiyat:</span>
                            <span className="font-bold">
                              {product.price.toLocaleString('tr-TR')}
                              {' '}
                              TL
                            </span>
                          </div>
                        )}
                  </div>

                  <div className="bg-card p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-2">Ürün Bilgileri</h3>
                    <div className="flex justify-between mb-2">
                      <span>SKU:</span>
                      <span>{product.sku}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Oluşturulma:</span>
                      <span>
                        {new Date(product.createdAt).toLocaleDateString(
                          'tr-TR',
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Son Güncelleme:</span>
                      <span>
                        {new Date(product.updatedAt).toLocaleDateString(
                          'tr-TR',
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-full bg-background text-foreground p-4 flex flex-col">
      {renderContent()}
    </div>
  );
};
