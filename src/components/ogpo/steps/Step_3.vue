<template>
  <div class="ogpo-tabs">
    <div
      class="ogpo-tabs__add-btn"
      v-if="($route.name === 'ogpo.create' || $route.name === 'ogpo.reissue') && +getHolder.natural_person_bool === 1"
    >
      <a-button @click="add">Добавить</a-button>
    </div>

    <a-tabs v-model="activeVehiclePaneKey" hide-add type="editable-card" @edit="onEdit">
      <a-tab-pane v-for="pane in stepData" :key="pane.key" :tab="pane.title">
        <VehicleForm :vehicle="pane.vehicle" :pane-key="pane.key" />
      </a-tab-pane>
    </a-tabs>

    <div v-if="$route.name === 'ogpo.create' || $route.name === 'ogpo.reissue'">
      <a-divider />

      <a-space :size="24">
        <a-button icon="caret-left" @click="goToPrevStep">Пред.</a-button>
        <a-button
          type="primary"
          @click="checkBeforeNextStep"
          :disabled="!getActiveVehiclePane || !getActiveVehiclePane.verified"
        >Далее</a-button>
      </a-space>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'
import VehicleForm from '@/components/ogpo/VehicleForm'

export default {
  components: {
    VehicleForm
  },

  props: {
    stepData: Array
  },

  computed: {
    ...mapState('ogpo', {
      policy: state => state.policy,
      vehicle: state => state.vehicle,
    }),

    activeVehiclePaneKey: {
      get() {
        return this.$store.state.ogpo.activeVehiclePaneKey;
      },
      set(value) {
        this.$store.commit('ogpo/SET_ACTIVE_VEHICLE_PANE_KEY', value);
      }
    },

    ...mapGetters('ogpo', [
      'getActiveVehiclePane',
      'getHolder',
      'getVehicleDoesNotBelongToRegion'
    ])
  },

  methods: {
    ...mapMutations('ogpo', [
      'ADD_VEHICLE_PANE',
      'REMOVE_VEHICLE_PANE',
      'SET_ACTIVE_VEHICLE_PANE_KEY',
    ]),

    ...mapActions('ogpo', [
      'getRegions',
      'getVehicleTypes',
      'goToPrevStep',
      'goToNextStep',
      'changeHolder',
    ]),

    onEdit(targetKey, action) {
      this[action](targetKey);
    },

    add() {
      let paneCount = this.stepData.length;

      if (paneCount && !this.stepData[paneCount - 1].verified) {
        this.$message.warning('Сначала сохраните данные текущего ТС.');
        return;
      }

      const activeVehiclePaneKey = Math.random().toString().substring(2, 7);

      this.ADD_VEHICLE_PANE({
        key: activeVehiclePaneKey,
        title: 'Новый',
        vehicle: { ...this.vehicle },
        verified: false
      });
      this.SET_ACTIVE_VEHICLE_PANE_KEY(activeVehiclePaneKey);
    },

    remove(targetKey) {
      let activeVehiclePaneKey = this.activeVehiclePaneKey;
      let lastIndex;

      this.stepData.forEach((pane, idx) => {
        if (pane.key === targetKey) {
          lastIndex = idx - 1;
        }
      });

      this.REMOVE_VEHICLE_PANE(targetKey);

      if (this.stepData.length && activeVehiclePaneKey === targetKey) {
        if (lastIndex >= 0) {
          activeVehiclePaneKey = this.stepData[lastIndex].key;
        } else {
          activeVehiclePaneKey = this.stepData[0].key;
        }
      }

      this.SET_ACTIVE_VEHICLE_PANE_KEY(activeVehiclePaneKey);
    },

    async checkBeforeNextStep() {
      if (this.getVehicleDoesNotBelongToRegion) {
        await this.changeHolder({
          holder: {
            notification_type_id: 0
          },
          verified: true
        });
      }

      this.goToNextStep();
    }
  },

  created() {
    this.getRegions();
    this.getVehicleTypes();
  }
}
</script>
