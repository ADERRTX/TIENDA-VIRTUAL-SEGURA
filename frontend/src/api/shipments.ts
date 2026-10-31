import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '../lib/http';
import type { PageMeta } from './seller';

export interface TrackingEvent {
  id: string;
  type: string;
  note: string | null;
  occurredAt: string;
}

export interface ShipmentSubOrder {
  id: string;
  status: string;
  seller: { storeName: string };
  order: {
    buyer: { fullName: string };
    address: { label: string; line1: string; city: string; province: string };
  };
  items: { id: string; name: string; quantity: number }[];
  shipment: {
    carrier: string;
    trackingCode: string;
    estimatedDate: string;
    trackingEvents: TrackingEvent[];
  };
}

export type ShipmentEventType = 'EN_TRANSITO' | 'EN_REPARTO' | 'ENTREGADO';

export function useShipments(page: number) {
  return useQuery({
    queryKey: ['shipments', page],
    queryFn: async () => {
      const response = await http<ShipmentSubOrder[], PageMeta>(`/shipments?page=${page}`);
      return { items: response.data, meta: response.meta };
    },
  });
}

export function useAddShipmentEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { subOrderId: string; type: ShipmentEventType }) => {
      const response = await http<unknown>(`/shipments/${input.subOrderId}/events`, {
        method: 'POST',
        body: JSON.stringify({ type: input.type }),
      });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}