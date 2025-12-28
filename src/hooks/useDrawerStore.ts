import { create } from "zustand";

type DrawerStore = {
  notif: boolean;
  cart: boolean;
  sidebar: boolean;
  filterbar: boolean;
  searchComp: boolean;
  open: (type: keyof Omit<DrawerStore, "open" | "close">) => void;
  close: (type: keyof Omit<DrawerStore, "open" | "close">) => void;
};

let openTimeout: NodeJS.Timeout | null = null;

const useDrawerStore = create<DrawerStore>((set, get) => ({
  notif: false,
  cart: false,
  sidebar: false,
  filterbar: false,
  searchComp: false,
  open: (type) => {
    // Очищаем предыдущий таймаут, если есть
    if (openTimeout) {
      clearTimeout(openTimeout);
    }

    // Используем небольшую задержку для предотвращения множественных срабатываний
    openTimeout = setTimeout(() => {
      set((state) => {
        // Проверяем, не открыт ли уже этот drawer
        if (state[type]) {
          return state;
        }

        // При открытии sidebar или filterbar - закрыть все другие drawer'ы
        if (type === 'sidebar') {
          return {
            notif: false,
            cart: false,
            sidebar: true,
            filterbar: false,
            searchComp: false
          };
        }
        if (type === 'filterbar') {
          return {
            notif: false,
            cart: false,
            sidebar: false,
            filterbar: true,
            searchComp: false
          };
        }

        // Для других типов - закрываем sidebar и filterbar
        return {
          ...state,
          sidebar: false,
          filterbar: false,
          [type]: true
        };
      });
      openTimeout = null;
    }, 10);
  },
  close: (type) => set({ [type]: false }),
}));

export default useDrawerStore;
