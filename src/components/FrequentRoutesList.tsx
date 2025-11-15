
import { useState, useEffect } from 'react';
import { FrequentRoute, TravelRecord, TransportationType } from '../types';
import { ValidationRules, parseNumericInput } from '../lib/validation';


interface FrequentRoutesListProps {
  routes: FrequentRoute[];
  onUseRoute: (route: Omit<TravelRecord, 'id' | 'date'>) => void;
    onAddRoute: (route: Omit<FrequentRoute, 'id'>) => void;
}
export default function FrequentRoutesList({ routes, onUseRoute, onAddRoute, onEditRoute }: FrequentRoutesListProps & { onEditRoute?: (route: FrequentRoute) => void }) {
  // 編集用の状態
  const [editingId, setEditingId] = useState<string | null>(null);

  // 編集開始
  const handleEditRoute = (route: FrequentRoute) => {
    setEditingId(route.id);
  };

  // 編集保存
  const handleSaveEdit = (edited: FrequentRoute) => {
    if (!edited.name || !edited.fromStation || !edited.toStation || !edited.fare) {
      alert('すべての必須項目を入力してください');
      return;
    }
    if (onEditRoute) {
      onEditRoute(edited);
    }
    setEditingId(null);
  };

  // 新規経路追加フォームの状態（fare はフォーム内では文字列）
  const [form, setForm] = useState({
    name: '',
    fromStation: '',
    toStation: '',
    transportationType: 'train' as TransportationType,
    transportationCompany: '',
    fare: '', // 文字列に変更（IME 入力対応）
  });
  const [showForm, setShowForm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション確認
    if (!form.name.trim()) {
      alert('経路名が無効です');
      return;
    }
    if (!ValidationRules.isValidStationName(form.fromStation)) {
      alert('出発駅が無効です');
      return;
    }
    if (!ValidationRules.isValidStationName(form.toStation)) {
      alert('到着駅が無効です');
      return;
    }
    if (!ValidationRules.isValidFare(form.fare)) {
      alert('運賃が無効です');
      return;
    }

    const fareNumber = parseNumericInput(form.fare);
    onAddRoute({
      name: form.name,
      fromStation: form.fromStation,
      toStation: form.toStation,
      transportationType: form.transportationType,
      transportationCompany: form.transportationCompany,
      fare: fareNumber,
    });

    setForm({
      name: '',
      fromStation: '',
      toStation: '',
      transportationType: 'train',
      transportationCompany: '',
      fare: '',
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">よく利用する経路</h2>

      <button
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setShowForm((v) => !v)}
      >
        {showForm ? 'キャンセル' : '新規経路を追加'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 space-y-2">
          {/* ...既存の新規追加フォーム... */}
          <div>
            <label className="block text-sm font-medium">経路名*</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium">出発駅*</label>
              <input
                name="fromStation"
                value={form.fromStation}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium">到着駅*</label>
              <input
                name="toStation"
                value={form.toStation}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-900 dark:text-gray-100"
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium">交通種別*</label>
              <select
                name="transportationType"
                value={form.transportationType}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="train">電車</option>
                <option value="bus">バス</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium">会社名</label>
              <input
                name="transportationCompany"
                value={form.transportationCompany}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">運賃*</label>
            <input
              name="fare"
              type="text"
              value={form.fare}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-900 dark:text-gray-100"
              placeholder="0"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              登録
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <RouteCard
            key={route.id}
            route={route}
            onUseRoute={onUseRoute}
            onEditRoute={handleEditRoute}
            isEditing={editingId === route.id}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={() => setEditingId(null)}
          />
        ))}
      </div>
    </div>
  );
}

interface RouteCardProps {
  route: FrequentRoute;
  onUseRoute: (route: Omit<TravelRecord, 'id' | 'date'>) => void;
  onEditRoute: (route: FrequentRoute) => void;
  isEditing: boolean;
  onSaveEdit: (route: FrequentRoute) => void;
  onCancelEdit: () => void;
}

function RouteCard({ route, onUseRoute, onEditRoute, isEditing, onSaveEdit, onCancelEdit }: RouteCardProps) {
  const [editForm, setEditForm] = useState<Omit<FrequentRoute, 'fare'> & { fare: string }>({
    ...route,
    fare: String(route.fare), // 編集フォームでは文字列として扱う
  });
  // 編集対象が切り替わったらフォームも更新
  useEffect(() => {
    setEditForm({
      ...route,
      fare: String(route.fare),
    });
  }, [route]);
  if (isEditing) {
    return (
      <form
        className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 space-y-2"
        onSubmit={e => {
          e.preventDefault();
          const fareNumber = parseNumericInput(editForm.fare);
          onSaveEdit({
            ...editForm,
            fare: fareNumber,
          });
        }}
      >
        <div>
          <label className="block text-sm font-medium">経路名*</label>
          <input
            name="name"
            value={editForm.name}
            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
            className="w-full border rounded px-2 py-1"
            required
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium">出発駅*</label>
            <input
              name="fromStation"
              value={editForm.fromStation}
              onChange={e => setEditForm(f => ({ ...f, fromStation: e.target.value }))}
              className="w-full border rounded px-2 py-1"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium">到着駅*</label>
            <input
              name="toStation"
              value={editForm.toStation}
              onChange={e => setEditForm(f => ({ ...f, toStation: e.target.value }))}
              className="w-full border rounded px-2 py-1"
              required
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium">交通種別*</label>
            <select
              name="transportationType"
              value={editForm.transportationType}
              onChange={e => setEditForm(f => ({ ...f, transportationType: e.target.value as TransportationType }))}
              className="w-full border rounded px-2 py-1"
            >
              <option value="train">電車</option>
              <option value="bus">バス</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium">会社名</label>
            <input
              name="transportationCompany"
              value={editForm.transportationCompany}
              onChange={e => setEditForm(f => ({ ...f, transportationCompany: e.target.value }))}
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">運賃*</label>
          <input
            name="fare"
            type="text"
            value={editForm.fare}
            onChange={e => setEditForm(f => ({ ...f, fare: e.target.value }))}
            className="w-full border rounded px-2 py-1"
            placeholder="0"
            required
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onCancelEdit} className="px-3 py-1 bg-gray-300 rounded">キャンセル</button>
          <button type="submit" className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700">保存</button>
        </div>
      </form>
    );
  }
  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-900">
      <h3 className="font-medium text-lg">{route.name}</h3>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        <p>{route.fromStation} → {route.toStation}</p>
        <p>{route.transportationType === 'train' ? '電車' : 'バス'}
          {route.transportationCompany && ` - ${route.transportationCompany}`}
        </p>
        <p>運賃: ¥{route.fare.toLocaleString()}</p>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onUseRoute({
            fromStation: route.fromStation,
            toStation: route.toStation,
            transportationType: route.transportationType,
            transportationCompany: route.transportationCompany,
            fare: route.fare,
          })}
          className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          この経路を使用
        </button>
        <button
          onClick={() => onEditRoute(route)}
          className="w-full bg-yellow-100 text-yellow-700 px-4 py-2 rounded-md hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200"
        >
          編集
        </button>
      </div>
    </div>
  );
}