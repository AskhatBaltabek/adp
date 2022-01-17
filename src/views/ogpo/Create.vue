<template>
  <div>
    <a-row style="margin-bottom: 32px">
      <a-col :span="24">
        <router-link to="/ogpo" style="margin-right: 8px">
          <a-button icon="unordered-list">Список полисов</a-button>
        </router-link>
      </a-col>
    </a-row>

    <a-row class="ogpo-create">
      <a-col class="ogpo-create__steps">
        <a-steps direction="vertical" :current="currentStep" @change="changeStep">
          <a-step
            v-for="(item, index) in steps"
            :key="index"
            :status="item.status"
            :title="item.title"
            :disabled="item.status === 'wait'"
          />
        </a-steps>
      </a-col>

      <a-col class="ogpo-create__content">
        <component v-bind:is="steps[currentStep].component" :stepData="steps[currentStep].data" v-if="steps[currentStep]"/>
      </a-col>
    </a-row>

    <a-divider dashed orientation="right"></a-divider>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import Step_1 from '@/components/ogpo/steps/Step_1'
import Step_2 from '@/components/ogpo/steps/Step_2'
import Step_3 from '@/components/ogpo/steps/Step_3'
import Step_4 from '@/components/ogpo/steps/Step_4'
import Step_5 from '@/components/ogpo/steps/Step_5'
import TerminationForm from '@/components/ogpo/operations/TerminationForm.vue'

export default {
  components: {
    Step_1,
    Step_2,
    Step_3,
    Step_4,
    Step_5,
    TerminationForm,
  },

  computed: {
    ...mapState({
      spinning: state => state.spinning,
      currentStep: state => state.ogpo.currentStep,
      steps: state => state.ogpo.steps,
    })
  },

  watch: {
    $route(to) {
      this.RESET();

      if (to.name === 'ogpo.show') {
        this.getPolicy(to.params.id);
      } else if (to.name === 'ogpo.reissue') {
        this.prepareDataForReissue(to.params.id);
      }
    }
  },

  methods: {
    ...mapMutations('ogpo', [
      'SET_STEP',
      'SET_STEP_STATUS',
      'RESET',
    ]),

    ...mapActions('ogpo', [
      'getPolicy',
      'getPolicyForReissue',
    ]),

    changeStep(picked) {
      this.SET_STEP_STATUS('finish');
      this.SET_STEP(picked);
      this.SET_STEP_STATUS('process');
    },

    async prepareDataForReissue(policyId) {
      let rp = await this.getPolicyForReissue(policyId);

      if (!rp.success) {
        this[rp.dialog]({ title: rp.message });
        this.$router.push({ name: 'ogpo.index'});
      }
    }
  },

  beforeMount() {
    if (this.$route.name === 'ogpo.show') {
      this.getPolicy(this.$route.params.id);
    } else if (this.$route.name === 'ogpo.reissue') {
      this.prepareDataForReissue(this.$route.params.id);
    }
  },

  beforeDestroy() {
    this.RESET();
  }
}
</script>

<style lang="scss">
.ogpo-create {
  display: flex !important;
  flex-wrap: nowrap;

  &__steps {
    flex: 0 0 260px;
    border-right: 1px solid #e3e3e3;
  }

  &__content {
    flex: 1 1 auto;
    min-width: 1px;
    margin-left: 25px;
  }
}

.ogpo-form {
  width: 700px;

  .ant-input-number,
  .ant-calendar-picker {
    width: 100%;
  }

  .ant-short-input {
    width: 125px;
    margin-right: 15px;
  }
}

.ogpo-tabs {
  &__add-btn {
    margin-bottom: 15px;
  }

  .ogpo-form {
    margin-top: 15px;

    &__save-btn {
      margin-bottom: 0;
    }
  }
}
</style>
