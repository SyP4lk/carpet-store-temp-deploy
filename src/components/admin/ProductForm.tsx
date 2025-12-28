'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProductFormData {
  productCode: string
  price: string
  sizes: string[]
  defaultSize: string
  images: string[]
  isNew: boolean
  isRunners: boolean
  inStock: boolean
  productNames: {
    en: string
    ru: string
  }
  descriptions: {
    en: string
    ru: string
  }
  features: {
    en: {
      head: string
      careAndWarranty: string[]
      technicalInfo: string[]
    }
    ru: {
      head: string
      careAndWarranty: string[]
      technicalInfo: string[]
    }
  }
  color: {
    en: string
    ru: string
    value: string
  }
  collection: {
    en: string
    ru: string
    value: string
  }
  style: {
    en: string
    ru: string
    value: string
  }
}

const initialFormData: ProductFormData = {
  productCode: '',
  price: '',
  sizes: [''],
  defaultSize: '',
  images: [''],
  isNew: false,
  isRunners: false,
  inStock: true,
  productNames: { en: '', ru: '' },
  descriptions: { en: '', ru: '' },
  features: {
    en: { head: '', careAndWarranty: [''], technicalInfo: [''] },
    ru: { head: '', careAndWarranty: [''], technicalInfo: [''] }
  },
  color: { en: '', ru: '', value: '' },
  collection: { en: '', ru: '', value: '' },
  style: { en: '', ru: '', value: '' }
}

function mapProductToFormData(product: any): ProductFormData {
  const getName = (locale: string) => product.productNames?.find((n: any) => n.locale === locale)?.name || ''
  const getDesc = (locale: string) => product.descriptions?.find((d: any) => d.locale === locale)?.description || ''
  const getFeature = (locale: string) => {
    const feature = product.features?.find((f: any) => f.locale === locale)
    return {
      head: feature?.head || '',
      careAndWarranty: feature?.careAndWarranty || [''],
      technicalInfo: feature?.technicalInfo || ['']
    }
  }
  const getColor = (locale: string) => product.colors?.find((c: any) => c.locale === locale)?.name || ''
  const getCollection = (locale: string) => product.collections?.find((c: any) => c.locale === locale)?.name || ''
  const getStyle = (locale: string) => product.styles?.find((s: any) => s.locale === locale)?.name || ''

  return {
    productCode: product.productCode || '',
    price: product.price || '',
    sizes: product.sizes?.length > 0 ? product.sizes : [''],
    defaultSize: product.defaultSize || '',
    images: product.images?.length > 0 ? product.images : [''],
    isNew: product.isNew || false,
    isRunners: product.isRunners || false,
    inStock: product.inStock || false,
    productNames: {
      en: getName('en'),
      ru: getName('ru')
    },
    descriptions: {
      en: getDesc('en'),
      ru: getDesc('ru')
    },
    features: {
      en: getFeature('en'),
      ru: getFeature('ru')
    },
    color: {
      en: getColor('en'),
      ru: getColor('ru'),
      value: product.colors?.[0]?.value || ''
    },
    collection: {
      en: getCollection('en'),
      ru: getCollection('ru'),
      value: product.collections?.[0]?.value || ''
    },
    style: {
      en: getStyle('en'),
      ru: getStyle('ru'),
      value: product.styles?.[0]?.value || ''
    }
  }
}

interface ProductFormProps {
  product?: any
}

export default function ProductForm({ product }: ProductFormProps) {
  const isEditMode = !!product
  const [formData, setFormData] = useState<ProductFormData>(
    product ? mapProductToFormData(product) : initialFormData
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = isEditMode ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = isEditMode ? 'PUT' : 'POST'

      // Filter out empty sizes, images, and features before submitting
      const cleanedData = {
        ...formData,
        sizes: formData.sizes.filter(s => s && s.trim().length > 0),
        images: formData.images.filter(img => img && img.trim().length > 0),
        features: {
          en: {
            head: formData.features.en.head,
            careAndWarranty: formData.features.en.careAndWarranty.filter(item => item && item.trim().length > 0),
            technicalInfo: formData.features.en.technicalInfo.filter(item => item && item.trim().length > 0)
          },
          ru: {
            head: formData.features.ru.head,
            careAndWarranty: formData.features.ru.careAndWarranty.filter(item => item && item.trim().length > 0),
            technicalInfo: formData.features.ru.technicalInfo.filter(item => item && item.trim().length > 0)
          }
        }
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Не удалось ${isEditMode ? 'обновить' : 'создать'} товар`)
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  const addArrayItem = (field: string, subField?: string) => {
    setFormData(prev => {
      const newData = { ...prev }
      if (subField) {
        // @ts-expect-error - Dynamic field access
        newData[field][subField].push('')
      } else {
        // @ts-expect-error - Dynamic field access
        newData[field].push('')
      }
      return newData
    })
  }

  const updateArrayItem = (field: string, index: number, value: string, subField?: string) => {
    setFormData(prev => {
      const newData = { ...prev }
      if (subField) {
        // @ts-expect-error - Dynamic field access
        newData[field][subField][index] = value
      } else {
        // @ts-expect-error - Dynamic field access
        newData[field][index] = value
      }
      return newData
    })
  }

  const removeArrayItem = (field: string, index: number, subField?: string) => {
    setFormData(prev => {
      const newData = { ...prev }
      if (subField) {
        // @ts-expect-error - Dynamic field access
        newData[field][subField] = newData[field][subField].filter((_: any, i: number) => i !== index)
      } else {
        // @ts-expect-error - Dynamic field access
        newData[field] = newData[field].filter((_: any, i: number) => i !== index)
      }
      return newData
    })
  }

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Разрешаем Enter только в textarea
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      // Если Enter нажат в textarea - разрешаем (для новой строки)
      if (target.tagName === 'TEXTAREA') {
        return;
      }
      // Во всех остальных случаях предотвращаем отправку формы
      e.preventDefault();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleFormKeyDown}
      className="space-y-8"
    >
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="productCode">Код товара *</Label>
              <Input
                id="productCode"
                value={formData.productCode}
                onChange={(e) => setFormData(prev => ({ ...prev, productCode: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Цена *</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isNew}
                onChange={(e) => setFormData(prev => ({ ...prev, isNew: e.target.checked }))}
                className="mr-2"
              />
              Новый товар
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isRunners}
                onChange={(e) => setFormData(prev => ({ ...prev, isRunners: e.target.checked }))}
                className="mr-2"
              />
              Дорожка
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))}
                className="mr-2"
              />
              В наличии
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Product Names */}
      <Card>
        <CardHeader>
          <CardTitle>Названия товара</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(['en', 'ru'] as const).map(locale => (
            <div key={locale}>
              <Label htmlFor={`name_${locale}`}>
                Название ({locale.toUpperCase()}) *
              </Label>
              <Input
                id={`name_${locale}`}
                value={formData.productNames[locale]}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  productNames: { ...prev.productNames, [locale]: e.target.value }
                }))}
                required
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Описания</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(['en', 'ru'] as const).map(locale => (
            <div key={locale}>
              <Label htmlFor={`desc_${locale}`}>
                Описание ({locale.toUpperCase()}) *
              </Label>
              <textarea
                id={`desc_${locale}`}
                value={formData.descriptions[locale]}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  descriptions: { ...prev.descriptions, [locale]: e.target.value }
                }))}
                className="w-full p-2 border rounded-md"
                rows={4}
                required
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Характеристики товара</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {(['en', 'ru'] as const).map(locale => (
            <div key={locale} className="border p-4 rounded-md space-y-4">
              <h3 className="font-semibold text-lg">Характеристики ({locale.toUpperCase()})</h3>

              {/* Head */}
              <div>
                <Label htmlFor={`feature_head_${locale}`}>
                  Заголовок описания *
                </Label>
                <textarea
                  id={`feature_head_${locale}`}
                  value={formData.features[locale].head}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    features: {
                      ...prev.features,
                      [locale]: { ...prev.features[locale], head: e.target.value }
                    }
                  }))}
                  placeholder="Premium quality test carpet"
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  required
                />
              </div>

              {/* Care and Warranty */}
              <div>
                <Label>Уход и гарантия *</Label>
                {formData.features[locale].careAndWarranty.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mt-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newArray = [...formData.features[locale].careAndWarranty];
                        newArray[idx] = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          features: {
                            ...prev.features,
                            [locale]: { ...prev.features[locale], careAndWarranty: newArray }
                          }
                        }));
                      }}
                      placeholder="Machine washable"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newArray = formData.features[locale].careAndWarranty.filter((_, i) => i !== idx);
                        setFormData(prev => ({
                          ...prev,
                          features: {
                            ...prev.features,
                            [locale]: { ...prev.features[locale], careAndWarranty: newArray }
                          }
                        }));
                      }}
                      className="px-3 py-2 bg-red-500 text-white rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      features: {
                        ...prev.features,
                        [locale]: {
                          ...prev.features[locale],
                          careAndWarranty: [...prev.features[locale].careAndWarranty, '']
                        }
                      }
                    }));
                  }}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  + Добавить пункт
                </button>
              </div>

              {/* Technical Info */}
              <div>
                <Label>Технические характеристики *</Label>
                {formData.features[locale].technicalInfo.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mt-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newArray = [...formData.features[locale].technicalInfo];
                        newArray[idx] = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          features: {
                            ...prev.features,
                            [locale]: { ...prev.features[locale], technicalInfo: newArray }
                          }
                        }));
                      }}
                      placeholder="100% Polypropylene"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newArray = formData.features[locale].technicalInfo.filter((_, i) => i !== idx);
                        setFormData(prev => ({
                          ...prev,
                          features: {
                            ...prev.features,
                            [locale]: { ...prev.features[locale], technicalInfo: newArray }
                          }
                        }));
                      }}
                      className="px-3 py-2 bg-red-500 text-white rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      features: {
                        ...prev.features,
                        [locale]: {
                          ...prev.features[locale],
                          technicalInfo: [...prev.features[locale].technicalInfo, '']
                        }
                      }
                    }));
                  }}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  + Добавить пункт
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Цвет</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="color_value">
              Код цвета для URL и фильтров *
              <span className="text-xs text-gray-500 block mt-1">
                Только английские буквы, цифры и дефис (например: beige, light-blue)
              </span>
            </Label>
            <Input
              id="color_value"
              value={formData.color.value}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                color: { ...prev.color, value: e.target.value }
              }))}
              placeholder="beige"
              required
            />
          </div>
          {(['en', 'ru'] as const).map(locale => (
            <div key={locale}>
              <Label htmlFor={`color_${locale}`}>
                Название цвета ({locale.toUpperCase()}) *
              </Label>
              <Input
                id={`color_${locale}`}
                value={formData.color[locale]}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  color: { ...prev.color, [locale]: e.target.value }
                }))}
                required
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Collection */}
      <Card>
        <CardHeader>
          <CardTitle>Коллекция</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="collection_value">
              Код коллекции для URL и фильтров *
              <span className="text-xs text-gray-500 block mt-1">
                Только английские буквы, цифры и дефис (например: oriental, modern-classic)
              </span>
            </Label>
            <Input
              id="collection_value"
              value={formData.collection.value}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                collection: { ...prev.collection, value: e.target.value }
              }))}
              placeholder="oriental"
              required
            />
          </div>
          {(['en', 'ru'] as const).map(locale => (
            <div key={locale}>
              <Label htmlFor={`collection_${locale}`}>
                Название коллекции ({locale.toUpperCase()}) *
              </Label>
              <Input
                id={`collection_${locale}`}
                value={formData.collection[locale]}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  collection: { ...prev.collection, [locale]: e.target.value }
                }))}
                required
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Style */}
      <Card>
        <CardHeader>
          <CardTitle>Стиль</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="style_value">
              Код стиля для URL и фильтров *
              <span className="text-xs text-gray-500 block mt-1">
                Только английские буквы, цифры и дефис (например: classic, modern-vintage)
              </span>
            </Label>
            <Input
              id="style_value"
              value={formData.style.value}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                style: { ...prev.style, value: e.target.value }
              }))}
              placeholder="contemporary"
              required
            />
          </div>
          {(['en', 'ru'] as const).map(locale => (
            <div key={locale}>
              <Label htmlFor={`style_${locale}`}>
                Название стиля ({locale.toUpperCase()}) *
              </Label>
              <Input
                id={`style_${locale}`}
                value={formData.style[locale]}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  style: { ...prev.style, [locale]: e.target.value }
                }))}
                required
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sizes */}
      <Card>
        <CardHeader>
          <CardTitle>Доступные размеры</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.sizes.map((size, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={size}
                onChange={(e) => updateArrayItem('sizes', index, e.target.value)}
                placeholder="например: 200x300, 150x200"
              />
              {formData.sizes.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeArrayItem('sizes', index)}
                  variant="destructive"
                >
                  Удалить
                </Button>
              )}
              {index === formData.sizes.length - 1 && (
                <Button
                  type="button"
                  onClick={() => addArrayItem('sizes')}
                  variant="outline"
                >
                  Добавить размер
                </Button>
              )}
            </div>
          ))}

          {/* Default Size Selection */}
          <div className="mt-6 pt-6 border-t">
            <Label htmlFor="defaultSize">Размер по умолчанию</Label>
            <p className="text-sm text-gray-500 mb-2">
              Выберите размер, который будет показан первым на странице товара
            </p>
            <select
              id="defaultSize"
              value={formData.defaultSize}
              onChange={(e) => setFormData(prev => ({ ...prev, defaultSize: e.target.value }))}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Не выбран (будет первый из списка)</option>
              {formData.sizes.filter(s => s.trim()).map((size, index) => (
                <option key={index} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Изображения товара</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.images.map((image, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={image}
                onChange={(e) => updateArrayItem('images', index, e.target.value)}
                placeholder="URL изображения"
              />
              {formData.images.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeArrayItem('images', index)}
                  variant="destructive"
                >
                  Удалить
                </Button>
              )}
              {index === formData.images.length - 1 && (
                <Button
                  type="button"
                  onClick={() => addArrayItem('images')}
                  variant="outline"
                >
                  Добавить изображение
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading
            ? (isEditMode ? 'Обновление...' : 'Создание...')
            : (isEditMode ? 'Обновить товар' : 'Создать товар')
          }
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/products')}
        >
          Отмена
        </Button>
      </div>
    </form>
  )
}