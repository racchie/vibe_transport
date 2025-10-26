import { FrequentRoute, TravelRecord } from '../types';

interface FrequentRoutesListProps {
  routes: FrequentRoute[];
  onUseRoute: (route: Omit<TravelRecord, 'id' | 'date'>) => void;
}

export default function FrequentRoutesList({ routes, onUseRoute }: FrequentRoutesListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">よく利用する経路</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <div
            key={route.id}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium text-lg">{route.name}</h3>
            <div className="mt-2 text-sm text-gray-600">
              <p>{route.fromStation} → {route.toStation}</p>
              <p>{route.transportationType === 'train' ? '電車' : 'バス'}
                {route.transportationCompany && ` - ${route.transportationCompany}`}
              </p>
              <p>運賃: ¥{route.fare.toLocaleString()}</p>
            </div>
            <button
              onClick={() => onUseRoute({
                fromStation: route.fromStation,
                toStation: route.toStation,
                transportationType: route.transportationType,
                transportationCompany: route.transportationCompany,
                fare: route.fare,
              })}
              className="mt-3 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              この経路を使用
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}