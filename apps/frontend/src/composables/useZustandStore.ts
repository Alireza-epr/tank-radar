import { onUnmounted, ref, type Ref } from "vue";

interface IZustandLikeStore<T> {
  getState: () => T;
  subscribe: (a_Listener: (a_State: T, a_PrevState: T) => void) => () => void;
}

export const useZustandStore = <T, U = T>(
  a_Store: IZustandLikeStore<T>,
  a_Selector: (a_State: T) => U = (a_State) => a_State as unknown as U,
): Ref<U> => {
  const state = ref(a_Selector(a_Store.getState())) as Ref<U>;

  const unsubscribe = a_Store.subscribe((a_NewState) => {
    state.value = a_Selector(a_NewState);
  });
  onUnmounted(unsubscribe);

  return state;
};
