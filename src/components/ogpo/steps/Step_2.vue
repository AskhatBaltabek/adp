<template>
  <div class="ogpo-tabs">
    <div
      class="ogpo-tabs__add-btn"
      v-if="($route.name === 'ogpo.create' || $route.name === 'ogpo.reissue') && +getHolder.natural_person_bool === 1"
    >
      <a-button @click="add">Добавить</a-button>
    </div>

    <a-tabs
      v-model="activeInsuredPaneKey"
      hide-add type="editable-card"
      @edit="onEdit"
      v-if="+getHolder.natural_person_bool === 1"
    >
      <a-tab-pane v-for="pane in stepData" :key="pane.key" :tab="pane.title">
        <InsuredForm :insured="pane.insured" :pane-key="pane.key"/>
      </a-tab-pane>
    </a-tabs>
    <h3 v-else>ЛИЦА, НА ОСНОВАНИИ ПУТЕВЫХ ЛИСТОВ И/ИЛИ ДОВЕРЕННОСТИ ВЫДАННЫХ СТРАХОВАТЕЛЕМ</h3>

    <div v-if="$route.name === 'ogpo.create' || $route.name === 'ogpo.reissue'">
      <a-divider/>

      <a-space :size="24">
        <a-button icon="caret-left" @click="goToPrevStep">Пред.</a-button>
        <a-button
          type="primary"
          @click="checkCountriesOnOffshoreList"
          :disabled="!getActiveInsuredPane || !getActiveInsuredPane.verified"
        >Далее</a-button>
      </a-space>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'
import InsuredForm from '@/components/ogpo/InsuredForm'

export default {
  components: {
    InsuredForm
  },

  props: {
    stepData: Array
  },

  computed: {
    ...mapState('ogpo', {
      policy: state => state.policy,
      client: state => state.client,
    }),

    activeInsuredPaneKey: {
      get() {
        return this.$store.state.ogpo.activeInsuredPaneKey;
      },
      set(value) {
        this.$store.commit('ogpo/SET_ACTIVE_INSURED_PANE_KEY', value);
      }
    },

    ...mapGetters('ogpo', [
      'getActiveInsuredPane',
      'getHolder',
      'getInsuredPeople',
      'getForeignClients',
    ])
  },

  methods: {
    ...mapMutations('ogpo', [
      'ADD_INSURED_PANE',
      'REMOVE_INSURED_PANE',
      'SET_ACTIVE_INSURED_PANE_KEY',
    ]),

    ...mapActions('ogpo', [
      'getDocumentTypes',
      'getCountries',
      'goToPrevStep',
      'goToNextStep',
      'changeInsuredPane',
      'determineOffshoreCountryClients',
    ]),

    onEdit(targetKey, action) {
      this[action](targetKey);
    },

    add() {
      let paneCount = this.stepData.length;

      if (paneCount && !this.stepData[paneCount - 1].verified) {
        this.$message.warning('Сначала сохраните данные текущего застрахованного.');
        return;
      }

      let activeInsuredPaneKey = Math.random().toString().substring(2, 7);

      this.ADD_INSURED_PANE({
        key: activeInsuredPaneKey,
        title: 'Новый',
        insured: { ...this.client },
        verified: false
      });
      this.SET_ACTIVE_INSURED_PANE_KEY(activeInsuredPaneKey);
    },

    remove(targetKey) {
      let activeInsuredPaneKey = this.activeInsuredPaneKey;
      let lastIndex;

      this.stepData.forEach((pane, idx) => {
        if (pane.key === targetKey) {
          lastIndex = idx - 1;
        }
      });

      this.REMOVE_INSURED_PANE(targetKey);

      if (this.stepData.length && activeInsuredPaneKey === targetKey) {
        if (lastIndex >= 0) {
          activeInsuredPaneKey = this.stepData[lastIndex].key;
        } else {
          activeInsuredPaneKey = this.stepData[0].key;
        }
      }

      this.SET_ACTIVE_INSURED_PANE_KEY(activeInsuredPaneKey);
    },

    async checkCountriesOnOffshoreList() {
      const foreignClients = this.getForeignClients;

      if (foreignClients.length) {
        const self = this;
        let rp = await this.determineOffshoreCountryClients({ foreign_clients: foreignClients });

        if (rp.success) {
          this.$confirm({
            title: 'Резиденты страны, входящей в офшорные зоны:',
            content: (
              <div>
                {rp.data.map(client => (
                  <div>
                    <b>{client.full_name}</b> ({client.country_name}) - {client.client_type ? 'Застрахованный' : 'Страхователь'}
                  </div>
                ))}
              </div>
            ),
            okText: 'Далее',
            onOk() {
              self.$store.dispatch('ogpo/goToNextStep');
            },
            cancelText: 'Отмена'
          });
        } else {
          this.goToNextStep();
        }
      } else {
        this.goToNextStep();
      }
    }
  },

  created() {
    this.getDocumentTypes();
    this.getCountries();
  },

  mounted() {
    if (!+this.getHolder.natural_person_bool) {
      this.changeInsuredPane({
        insured: {
          id: 2,
          natural_person_bool: 0,
          juridical_person_name: 'ЛИЦА, НА ОСНОВАНИИ ПУТЕВЫХ ЛИСТОВ И/ИЛИ ДОВЕРЕННОСТИ ВЫДАННЫХ СТРАХОВАТЕЛЕМ',
          resident_bool: this.getHolder.resident_bool,
          country_id: 1
        },
        verified: true
      });
    }
  }
}
</script>
