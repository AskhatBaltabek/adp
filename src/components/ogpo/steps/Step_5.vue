<template>
  <div>
    <a-form-model
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      class="ogpo-form"
    >
      <a-form-model-item label="Номер полиса" v-if="!!policy.policy_number">
        <span class="ant-form-text"><b>{{ policy.policy_number }}</b></span>
      </a-form-model-item>

      <a-form-model-item label="Переоформлен с" v-if="!!policy.parent">
        <span class="ant-form-text"><b>{{ policy.parent.policy_number }}</b></span>
      </a-form-model-item>

      <a-form-model-item label="Номер полиса обоюдки" v-if="!!policy.muns_policy_number">
        <span class="ant-form-text"><b>{{ policy.muns_policy_number }}</b></span>
      </a-form-model-item>

      <a-form-model-item label="Страхователь">
        <span class="ant-form-text"><b>{{ getHolderFullName }}</b></span>
      </a-form-model-item>

      <a-form-model-item label="Список застрахованных">
        <div v-for="insured in getInsuredPeople" :key="insured.id">
          <span v-if="+insured.natural_person_bool === 1">
            <b>{{ `${insured.last_name} ${insured.first_name} ${insured.middle_name ? insured.middle_name : ''}` }}</b>
          </span>
          <span v-else><b>ЛИЦА, НА ОСНОВАНИИ ПУТЕВЫХ ЛИСТОВ И/ИЛИ ДОВЕРЕННОСТИ ВЫДАННЫХ СТРАХОВАТЕЛЕМ</b></span>
        </div>
      </a-form-model-item>

      <a-form-model-item label="Список ТС">
        <div v-for="vehicle in getVehicles" :key="vehicle.id">
          <b>{{ `${vehicle.mark}, ${vehicle.model}, ${vehicle.reg_num}` }}</b>
        </div>
      </a-form-model-item>

      <a-form-model-item label="Страховая премия">
        <span class="ant-form-text"><b>{{ getPremium }}</b></span>
      </a-form-model-item>

      <a-form-model-item label="Период страхования">
        <span class="ant-form-text"><b>{{ getPeriod }}</b></span>
      </a-form-model-item>
    </a-form-model>

    <a-divider v-if="$route.name === 'ogpo.create' || $route.name === 'ogpo.reissue' || policy.status === 8 || policy.status === 2"/>
    <a-space :size="24" v-if="$route.name === 'ogpo.create' || $route.name === 'ogpo.reissue'">
      <a-button icon="caret-left" @click="goToPrevStep">Пред.</a-button>
      <a-button type="primary" @click="issuePolicy">Выписать полис</a-button>
    </a-space>
    <a-space :size="24" v-if="policy.status === 8 || policy.status === 2">
      <a-button @click="downloadPdfStatement">Скачать анкету</a-button>
      <a-button @click="downloadPdfNotification">Скачать уведомления</a-button>
    </a-space>

    <a-divider v-if="policy.status === 8 && (policyBeginDatePassed || policy.issued_via_ms)"/>
    <a-space :size="24">
      <a-button
        type="danger"
        @click="rescindIssuedPolicy"
        v-if="policy.status === 8 && policyIssuedToday && policy.issued_via_ms"
      >Ошибка оператора</a-button>

      <a-button
        type="danger"
        @click="showTerminationWarning"
        v-if="policy.status === 8 && policyBeginDatePassed && !getExtraStep.refund_amount"
      >Расторгнуть</a-button>

      <a-button
        type="primary"
        @click="showReissueWarning"
        v-if="policy.status === 8 && policyBeginDatePassed"
      >Переоформить</a-button>
    </a-space>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { downloadFile } from '@/helpers/fileHelper'
import moment from 'moment'

export default {
  computed: {
    ...mapState('ogpo', {
      policy: state => state.policy
    }),

    ...mapMutations('ogpo', [
      'SET_POLICY',
    ]),

    ...mapGetters('ogpo', [
      'getHolderFullName',
      'getInsuredPeople',
      'getVehicles',
      'getPeriod',
      'getPremium',
      'getExtraStep',
    ]),

    policyIssuedToday() {
      let issuedDate = moment(this.policy.issued_at, 'DD.MM.YYYY').format('YYYY-MM-DD');

      return moment(moment().format('YYYY-MM-DD')).isSame(issuedDate);
    },

    policyBeginDatePassed() {
      let dateBegin = moment(this.policy.started_at, 'DD.MM.YYYY').format('YYYY-MM-DD');

      return moment(moment().format('YYYY-MM-DD')).isAfter(dateBegin);
    }
  },

  methods: {
    ...mapActions('ogpo', [
      'goToPrevStep',
      'setPolicy',
      'getPdfDocument',
      'rescindPolicy',
      'getRefundAmount',
    ]),

    async downloadPdfStatement() {
      let rp = await this.getPdfDocument({ document_type: 'statement' });

      if (rp.success) {
        downloadFile(rp.data.filename, 'data:application/octet-stream;base64,' + rp.data.file);
      } else {
        this[rp.dialog]({ title: rp.message });
      }
    },

    async downloadPdfNotification() {
      let rp = await this.getPdfDocument({ document_type: 'notification' });

      if (rp.success) {
        downloadFile(rp.data.filename, 'data:application/octet-stream;base64,' + rp.data.file);
      } else {
        this[rp.dialog]({ title: rp.message });
      }
    },

    async issuePolicy() {
      let policyId = this.$route.name === 'ogpo.reissue' ? this.$route.params.id : 0;
      let rp = await this.setPolicy(policyId);

      if (rp.success) {
        this.$message.success(rp.message);
        this.$router.push({ name: 'ogpo.show', params: { id: this.policy.id } });
      } else {
        this.$error({ title: rp.message });
      }
    },

    rescindIssuedPolicy() {
      const self = this;

      this.$confirm({
        title: 'Вы действительно хотите пометить данный полис как выписанный ошибочно?',
        content: 'Внимание! Данную операцию невозможно отменить впоследствии!',
        okText: 'Да',
        okType: 'danger',
        cancelText: 'Нет',
        async onOk() {
          let rp = await self.rescindPolicy({ id: self.policy.id });

          if (rp.success) {
            self.$store.commit('ogpo/SET_POLICY', {
              ...self.policy,
              reason_id: 6
            });

            self.$success({ title: rp.message });
          } else {
            self.$error({ title: rp.message });
          }
        },
      });
    },

    async showTerminationWarning() {
      const self = this;

      this.$confirm({
        title: 'Вы уверены, что хотите расторгнуть этот договор?',
        content: 'Внимание! Данную операцию невозможно отменить впоследствии!',
        okText: 'Да',
        okType: 'danger',
        cancelText: 'Нет',
        async onOk() {
          let rp = await self.$store.dispatch('ogpo/getRefundAmount', self.policy.id);

          if (rp.success) {
            self.$store.commit('ogpo/ADD_STEP', {
              data: {
                muns_policy_number: rp.data.muns_policy_number,
                muns_refund_amount: rp.data.muns_refund_amount,
                refund_amount: rp.data.refund_amount,
                termination_reason: undefined,
                refund_method: undefined,
                bank_name: '',
                iban: '',
                bin: '',
                bik: '',
                card_number: '',
                card_holder: '',
              },
              component: 'TerminationForm',
              title: 'Расторжение полиса',
              status: 'wait',
            });

            self.$store.dispatch('ogpo/goToNextStep');
          } else {
            self[rp.dialog]({ title: rp.message });
          }
        }
      });
    },

    async showReissueWarning() {
      const self = this;

      this.$confirm({
        title: 'Вы уверены, что хотите переоформить этот договор?',
        content: 'Внимание! Данную операцию невозможно отменить впоследствии!',
        okText: 'Да',
        okType: 'danger',
        cancelText: 'Нет',
        async onOk() {
          self.$router.push({ name: 'ogpo.reissue', params: { id: self.policy.id } });
        }
      });
    }
  },
}
</script>
