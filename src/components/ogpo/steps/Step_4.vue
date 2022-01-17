<template>
  <div>
    <a-form-model
      ref="form"
      :model="form"
      :rules="rules"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      class="ogpo-form"
    >
      <a-form-model-item prop="date_beg" label="Дата начала">
        <a-date-picker
          :value="dateBegin"
          :format="dateFormat"
          :disabled-date="disabledDate"
          :disabled="$route.name !== 'ogpo.create'"
          placeholder="Укажите дату начала"
          @change="changeDateBegin"
        />
      </a-form-model-item>

      <a-form-model-item prop="date_end" label="Дата окончания">
        <a-date-picker
          :value="dateEnd"
          :format="dateFormat"
          placeholder="Укажите дату окончания"
          @change="changeDateEnd"
          v-if="getVehicleDoesNotBelongToRegion"
        />
        <span class="ant-form-text" v-else>{{ form.date_end }}</span>
      </a-form-model-item>

      <a-form-model-item
        label="Сумма возврата"
        v-if="$route.name === 'ogpo.reissue' || form.refund_amount > 0"
      >
        <div class="ant-form-text">{{ form.refund_amount }} тг</div>
      </a-form-model-item>

      <a-form-model-item label="Страховая премия">
        <div class="ant-form-text">{{ form.insurance_premium }} тг</div>
      </a-form-model-item>

      <a-form-model-item :wrapper-col="{ span: 16, offset: 8 }">
        <a-button
          type="primary"
          @click="getInsurancePremium"
          v-if="$route.name === 'ogpo.create' || $route.name === 'ogpo.reissue'"
        >Рассчитать премию</a-button>
      </a-form-model-item>
    </a-form-model>

    <div v-if="$route.name === 'ogpo.create' || $route.name === 'ogpo.reissue'">
      <a-divider/>

      <a-space :size="24">
        <a-button icon="caret-left" @click="goToPrevStep">Пред.</a-button>
        <a-button type="primary" @click="saveForm" :disabled="!form.insurance_premium">Далее</a-button>
      </a-space>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import moment from 'moment'

export default {
  props: {
    stepData: Object
  },

  data() {
    return {
      dateFormat: 'DD.MM.YYYY',
      form: { ...this.stepData },
      smsCode: null,
      rules: {
        date_beg: [
          { required: true, message: 'Поле "Дата начала" обязательно для заполнения', trigger: 'change' },
        ],
        date_end: [
          { required: true, message: 'Поле "Дата окончания" обязательно для заполнения', trigger: 'change' },
        ]
      }
    };
  },

  computed: {
    ...mapState('ogpo', {
      policy: state => state.policy
    }),

    ...mapGetters('ogpo', [
      'getVehicleDoesNotBelongToRegion'
    ]),

    dateBegin() {
      return this.form.date_beg ? moment(this.form.date_beg, this.dateFormat) : null;
    },

    dateEnd() {
      return this.form.date_end ? moment(this.form.date_end, this.dateFormat) : null;
    },
  },

  watch: {
    stepData(value) {
      this.form = { ...value };
    }
  },

  methods: {
    ...mapActions('ogpo', [
      'goToPrevStep',
      'goToNextStep',
      'calculateInsurancePremium'
    ]),

    changeDateBegin(date, dateString) {
      this.form.date_beg = dateString;

      this.changeFormDateEnd(dateString);
    },

    changeDateEnd(date, dateString) {
      this.form.date_end = dateString;
    },

    changeFormDateEnd(dateBegin) {
      if (!this.getVehicleDoesNotBelongToRegion) {
        let m = dateBegin ? moment(dateBegin, this.dateFormat) : moment();

        this.form.date_end = m.add(1, 'years').subtract(1, 'days').format(this.dateFormat);
      }
    },

    disabledDate(current) {
      return current && current < moment().subtract(1, 'days');
    },

    getInsurancePremium() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          let policyId = this.$route.name === 'ogpo.reissue' ? this.$route.params.id : 0;
          let rp = await this.calculateInsurancePremium({
            ...this.form,
            id: policyId
          });

          if (rp.success) {
            this.$message.success(rp.message);
          } else {
            this[rp.dialog]({ title: rp.message });
          }
        }
      });
    },

    saveForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.goToNextStep();
        }
      });
    }
  },

  mounted() {
    if (this.$route.name === 'ogpo.create') {
      this.form.date_beg = moment().format(this.dateFormat);
      this.changeFormDateEnd();
    }

    if (this.$route.name === 'ogpo.reissue') {
      let dateBegin = moment().add(1, 'days').format(this.dateFormat);

      this.form.date_beg = dateBegin;
      this.changeFormDateEnd(dateBegin);
    }
  }
}
</script>
