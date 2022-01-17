<template>
  <div>
    <a-spin :spinning="loading" tip="Загрузка...">
      <a-row>
        <a-col>
          <a-button type="primary" icon="unordered-list"><router-link style="color:#fff" :to="'/autoshop'"> Список полиов</router-link></a-button>
        </a-col>
      </a-row>
      <a-divider />
      <a-row>
        <a-col class="order__steps-list" :span="2">
          <a-steps @change="onChange" direction="vertical" :current="current">
            <a-step
                :status="item.status"
                v-for="(item, index) in steps"
                :key="index"
                :title="item.title"
                :disabled="item.status === 'wait'"
            />
          </a-steps>
        </a-col>
        <a-col :span="18">
          <div class="order__step-wrap">
            <component v-if="steps[current] && isActive" :stepData="steps[current].data" :key="current" v-bind:is="steps[current].component" />
          </div>
        </a-col>
      </a-row>
      <a-divider :dashed="true" orientation="right" />
    </a-spin>
  </div>
</template>

<script>
import Step_1 from "@/components/autoshop/steps/Step_1";
import Step_2 from "@/components/autoshop/steps/Step_2";
import Step_3 from "@/components/autoshop/steps/Step_3";
import {mapState} from "vuex";

export default {
  components: {Step_1, Step_2, Step_3},
  data() {
    return {
      isActive: false
    }
  },
  async mounted() {
    await this.loadDictionary()
    if(this.$route.params.id !== 'new') {
      await this.$store.dispatch('autoshop/LOAD_POLICY', this.$route.params.id)
          .then(() => this.isActive = true)
    }
    else {
      await this.$store.dispatch('autoshop/RESET_STATE')
      this.isActive = true
    }
  },
  computed: {
    ...mapState('autoshop', {
      steps: state => state.steps,
      current: state => state.currentStep,
      loading: state => state.loading
    })
  },
  methods: {
    loadDictionary() {
      this.$store.dispatch('autoshop/LOAD_COUNTRIES');
      this.$store.dispatch('autoshop/LOAD_MULTI_RANGES');
      this.$store.dispatch('autoshop/LOAD_PURPOSES');
      this.$store.dispatch('autoshop/LOAD_AMOUNT_SUMS');
      this.$store.dispatch('autoshop/LOAD_CORRECTION_FACTORS');
      this.$store.dispatch('autoshop/LOAD_TARIFES');
    },
    onChange(current) {
      this.$store.dispatch('autoshop/CHANGE_STEP', current)
    },
    save() {
    }
  },
}
</script>

<style lang="scss">
.ant-row-inline-flex {
  display: inline-flex !important;
}
.order {
  &__steps-list {
    border-right: 1px solid #e3e3e3;
    min-width:250px;
    max-width:300px;
  }

  &__step-wrap {
    margin: 0 0 12px 24px;
    max-width: 100%;
  }
}

</style>