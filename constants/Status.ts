export const statusMap: Record<string, { label: string; colorBg: string; colorText: string }> = {
  NEW: { label: 'Nouveau', colorBg: '#DBEAFE', colorText: '#1D4ED8' },
  SENT: { label: 'Envoyé', colorBg: '#E0F2FE', colorText: '#0369A1' },
  WAITING_FOR_ACCEPTANCE: {
    label: "En attente d'acceptation",
    colorBg: '#FEF3C7',
    colorText: '#B45309',
  },
  ACCEPTED: { label: 'Accepté', colorBg: '#DCFCE7', colorText: '#065F46' },
  REFUSED: { label: 'Refusé', colorBg: '#FEE2E2', colorText: '#B91C1C' },
  ITEM_RETRIEVED: { label: 'Objet récupéré', colorBg: '#E0E7FF', colorText: '#4338CA' },
  MOVING_TO_DESTINATION: {
    label: 'En route vers destination',
    colorBg: '#EDE9FE',
    colorText: '#7C3AED',
  },
  MOVING_TO_ORIGIN: { label: 'En route vers origine', colorBg: '#EDE9FE', colorText: '#7C3AED' },
  WAITING_FOR_PORTERS: {
    label: 'En attente de brancardiers',
    colorBg: '#FFEDD5',
    colorText: '#C2410C',
  },
  COMPLETED: { label: 'Terminé', colorBg: '#DCFCE7', colorText: '#064E3B' },
  ABANDONED: { label: 'Abandonné', colorBg: '#E5E7EB', colorText: '#374151' },
  CANCELLED: { label: 'Annulé', colorBg: '#E5E7EB', colorText: '#374151' },
  DELETED: { label: 'Supprimé', colorBg: '#E5E7EB', colorText: '#374151' },
};
