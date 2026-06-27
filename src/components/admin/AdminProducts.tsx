import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Product, BADGES, STATIC_CATEGORIES, api } from './adminTypes';

function SortableItem({ product, isActive, onClick, onDelete }: {
  product: Product; isActive: boolean; onClick: () => void; onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style}
      className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'}`}
      onClick={onClick}>
      <button {...attributes} {...listeners} className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing flex-shrink-0 touch-none" onClick={e => e.stopPropagation()}>
        <Icon name="GripVertical" size={16} />
      </button>
      <img src={product.image || 'https://placehold.co/48x48/f4f4f5/a1a1aa?text=?'} alt={product.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-muted" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{product.name}</p>
        <p className="text-xs text-muted-foreground">{product.price.toLocaleString('ru-RU')} ₽</p>
      </div>
      {product.badge && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex-shrink-0">{product.badge}</span>
      )}
      <button onClick={e => { e.stopPropagation(); onDelete(); }}
        className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0 p-1">
        <Icon name="Trash2" size={16} />
      </button>
    </div>
  );
}

interface Props {
  products: Product[];
  editing: Product | null;
  saving: boolean;
  uploading: boolean;
  drawerOpen: boolean;
  categories: { id: number; name: string }[];
  token: string;
  onSetProducts: (products: Product[]) => void;
  onOpenEditor: (product: Product) => void;
  onCloseEditor: () => void;
  onSetEditing: (product: Product | null) => void;
  onDelete: (id: number) => void;
  onSave: () => void;
  onCreate: () => void;
  onMsg: (msg: string) => void;
  onSetUploading: (v: boolean) => void;
  onAddCategory: (name: string) => Promise<void>;
}

export default function AdminProducts({
  products, editing, saving, uploading, drawerOpen, categories, token,
  onSetProducts, onOpenEditor, onCloseEditor, onSetEditing, onDelete, onSave, onCreate, onMsg, onSetUploading, onAddCategory,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = products.findIndex(p => p.id === active.id);
    const newIndex = products.findIndex(p => p.id === over.id);
    const newOrder = arrayMove(products, oldIndex, newIndex);
    onSetProducts(newOrder);
    await api('reorder', { order: newOrder.map(p => p.id) }, token);
    onMsg('Порядок сохранён!');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const ext = file.name.split('.').pop() || 'jpg';
    const reader = new FileReader();
    reader.onload = async () => {
      onSetUploading(true);
      const base64 = (reader.result as string).split(',')[1];
      const data = await api('upload_image', { id: editing.id, image: base64, ext }, token);
      if (data.image) onSetEditing(editing ? { ...editing, image: data.image } : null);
      onSetUploading(false);
      onMsg('Фото обновлено!');
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* Список товаров */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-xl">Товары <span className="text-muted-foreground font-normal text-base">({products.length})</span></h2>
          <Button size="sm" className="gradient-brand text-white rounded-full h-9 px-4 hover:opacity-90" onClick={onCreate}>
            <Icon name="Plus" size={15} className="mr-1" />Добавить
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
          <Icon name="GripVertical" size={11} />Перетащите для изменения порядка
        </p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {products.map(p => (
                <SortableItem key={p.id} product={p}
                  isActive={editing?.id === p.id}
                  onClick={() => onOpenEditor(p)}
                  onDelete={() => onDelete(p.id)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        {products.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Icon name="Package" size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Товаров пока нет</p>
            <Button className="gradient-brand text-white rounded-full mt-4 hover:opacity-90" onClick={onCreate}>
              Добавить первый товар
            </Button>
          </div>
        )}
      </div>

      {/* Drawer-редактор */}
      {editing && (
        <>
          <div
            className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onCloseEditor}
          />
          <div className={`fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-3xl shadow-2xl transition-transform duration-300 flex flex-col ${drawerOpen ? 'translate-y-0' : 'translate-y-full'}`}
            style={{ maxHeight: '92dvh' }}>
            <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-border">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-xl leading-tight">{editing.name || 'Новый товар'}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{editing.category}</p>
                </div>
                <button onClick={onCloseEditor} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Icon name="X" size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {/* Фото */}
              <div className="flex gap-4 items-start">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-muted border border-border flex-shrink-0">
                  {editing.image
                    ? <img src={editing.image} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Icon name="ImageOff" size={24} /></div>
                  }
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Icon name="Loader2" size={20} className="text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-2">Фото товара</p>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <Button variant="outline" className="w-full rounded-xl h-10 text-sm" onClick={() => fileRef.current?.click()}>
                    <Icon name="Camera" size={15} className="mr-2" />Загрузить фото
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1.5">Можно сфотографировать с телефона</p>
                </div>
              </div>

              {/* Название */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Название товара</label>
                <Input value={editing.name} onChange={e => onSetEditing({ ...editing, name: e.target.value })}
                  className="h-12 rounded-xl text-base" placeholder="Введите название" />
              </div>

              {/* Описание */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Описание</label>
                <textarea value={editing.description || ''}
                  onChange={e => onSetEditing({ ...editing, description: e.target.value })}
                  placeholder="Общее описание товара — что это, для кого, чем выделяется..."
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              {/* Состав */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Состав / характеристики</label>
                <textarea value={editing.composition || ''}
                  onChange={e => onSetEditing({ ...editing, composition: e.target.value })}
                  placeholder="Например: натуральный хлопок, бамбуковое волокно. Или: двигатель 250cc, КПП автомат..."
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              {/* Способ применения */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Способ применения / инструкция</label>
                <textarea value={editing.usage_instructions || ''}
                  onChange={e => onSetEditing({ ...editing, usage_instructions: e.target.value })}
                  placeholder="Как использовать товар, советы по применению, условия хранения..."
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              {/* Преимущества */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Преимущества</label>
                <p className="text-xs text-muted-foreground mb-2">Каждое преимущество с новой строки</p>
                {(editing.features || '').split('\n').filter(f => f.trim()).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <div className="flex-1 flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
                      <div className="w-4 h-4 rounded-full gradient-brand flex items-center justify-center flex-shrink-0">
                        <Icon name="Check" size={10} className="text-white" />
                      </div>
                      <span className="text-sm font-medium flex-1">{feat}</span>
                    </div>
                    <button
                      onClick={() => {
                        const lines = (editing.features || '').split('\n');
                        lines.splice(idx, 1);
                        onSetEditing({ ...editing, features: lines.join('\n') });
                      }}
                      className="w-7 h-7 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors flex-shrink-0">
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Добавить преимущество..."
                    className="h-10 rounded-xl text-sm flex-1"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const val = e.currentTarget.value.trim();
                        const cur = (editing.features || '').split('\n').filter(f => f.trim());
                        onSetEditing({ ...editing, features: [...cur, val].join('\n') });
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    className="h-10 px-3 rounded-xl flex-shrink-0"
                    onClick={(e) => {
                      const input = (e.currentTarget.previousSibling as HTMLInputElement);
                      if (input?.value.trim()) {
                        const val = input.value.trim();
                        const cur = (editing.features || '').split('\n').filter(f => f.trim());
                        onSetEditing({ ...editing, features: [...cur, val].join('\n') });
                        input.value = '';
                      }
                    }}>
                    <Icon name="Plus" size={16} />
                  </Button>
                </div>
              </div>

              {/* Бренд */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Бренд / производитель</label>
                <Input value={editing.brand} onChange={e => onSetEditing({ ...editing, brand: e.target.value })}
                  className="h-12 rounded-xl" placeholder="Например: Xiaomi" />
              </div>

              {/* Категория */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Категория</label>
                <select value={editing.category} onChange={e => onSetEditing({ ...editing, category: e.target.value })}
                  className="w-full h-12 rounded-xl border border-input bg-background px-3 text-sm mb-2">
                  {(categories.length > 0 ? categories.map(c => c.name) : STATIC_CATEGORIES).map(c => <option key={c}>{c}</option>)}
                </select>
                <div className="flex gap-2">
                  <Input
                    id="new-cat-input"
                    placeholder="Новая категория..."
                    className="h-9 rounded-xl text-sm flex-1"
                    onKeyDown={async e => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const name = e.currentTarget.value.trim();
                        await onAddCategory(name);
                        onSetEditing({ ...editing, category: name });
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button variant="outline" className="h-9 px-3 rounded-xl flex-shrink-0"
                    onClick={async () => {
                      const input = document.getElementById('new-cat-input') as HTMLInputElement;
                      if (input?.value.trim()) {
                        const name = input.value.trim();
                        await onAddCategory(name);
                        onSetEditing({ ...editing, category: name });
                        input.value = '';
                      }
                    }}>
                    <Icon name="Plus" size={15} />
                  </Button>
                </div>
              </div>

              {/* Цены */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Розничная цена ₽</label>
                  <Input type="number" inputMode="numeric" value={editing.price}
                    onChange={e => onSetEditing({ ...editing, price: Number(e.target.value) })}
                    className="h-12 rounded-xl text-base font-semibold" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Оптовая цена ₽</label>
                  <Input type="number" inputMode="numeric" value={editing.wholesale}
                    onChange={e => onSetEditing({ ...editing, wholesale: Number(e.target.value) })}
                    className="h-12 rounded-xl text-base" />
                </div>
              </div>

              {/* Мин. кол-во для опта */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Мин. кол-во для оптовой цены, шт.
                  <span className="ml-1 text-muted-foreground/60">(0 — использовать общий порог)</span>
                </label>
                <Input type="number" inputMode="numeric" min={0} value={editing.wholesale_min_qty || 0}
                  onChange={e => onSetEditing({ ...editing, wholesale_min_qty: Number(e.target.value) })}
                  className="h-12 rounded-xl text-base" placeholder="0" />
              </div>

              {/* Значок */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2">Значок</label>
                <div className="grid grid-cols-4 gap-2">
                  {BADGES.map(b => (
                    <button key={b} onClick={() => onSetEditing({ ...editing, badge: b || null })}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${editing.badge === (b || null) ? 'gradient-brand text-white border-transparent' : 'border-border bg-card hover:border-primary'}`}>
                      {b || 'Нет'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Опасная зона */}
              <div className="border border-red-200 rounded-2xl p-4">
                <p className="text-xs text-muted-foreground mb-2">Удаление товара</p>
                <Button variant="outline" className="w-full rounded-xl text-red-500 border-red-200 hover:bg-red-50 h-10 text-sm"
                  onClick={() => onDelete(editing.id)}>
                  <Icon name="Trash2" size={14} className="mr-2" />Удалить товар
                </Button>
              </div>
              <div className="h-4" />
            </div>

            <div className="flex-shrink-0 px-5 py-4 border-t border-border bg-background">
              <Button className="w-full gradient-brand text-white rounded-full h-14 text-base font-semibold hover:opacity-90" onClick={onSave} disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2"><Icon name="Loader2" size={18} className="animate-spin" />Сохраняю...</span>
                ) : 'Сохранить изменения'}
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}