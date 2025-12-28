import ProductForm from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Добавить новый товар</h1>
        <p className="text-gray-600 mt-2">
          Создайте новый товар с многоязычной поддержкой
        </p>
      </div>

      <ProductForm />
    </div>
  )
}