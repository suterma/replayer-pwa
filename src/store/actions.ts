import { ActionTree, ActionContext } from 'vuex'
import { State } from './state'
import { Mutations } from './mutations'
import { ActionTypes } from './action-types'
import { MutationTypes } from './mutation-types'

type AugmentedActionContext = {
    commit<K extends keyof Mutations>(
      key: K,
      payload: Parameters<Mutations[K]>[1]
    ): ReturnType<Mutations[K]>
  } & Omit<ActionContext<State, State>, 'commit'>
  
  export interface Actions {
    [ActionTypes.PLAY_TRACK](
      { commit }: AugmentedActionContext,
      payload: string
    ): Promise<string>
  }
  export const actions: ActionTree<State, State> & Actions = {
    [ActionTypes.PLAY_TRACK]({ commit }) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const data = 'action return value'; //TODO currently unused
          commit(MutationTypes.SET_PROGRESS_MESSAGE, "Playing track...");
          resolve(data);
        }, 500)
      })
    },
  }
