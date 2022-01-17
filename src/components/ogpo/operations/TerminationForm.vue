<template>
  <a-form-model
    ref="form"
    :model="form"
    :rules="rules"
    :label-col="{ span: 8 }"
    :wrapper-col="{ span: 16 }"
    class="ogpo-form"
  >
    <a-form-model-item prop="refund_amount" label="Сумма возврата">
      <span class="ant-form-text">{{ form.refund_amount }} тг</span>
    </a-form-model-item>

    <a-form-model-item label="Сумма возврата обоюдки" v-if="!!form.muns_policy_number">
      <span class="ant-form-text">{{ form.muns_refund_amount }} тг</span>
    </a-form-model-item>

    <a-form-model-item prop="termination_reason" label="Причина расторжения" v-if="!policy.child">
      <a-select
        v-model="form.termination_reason"
        placeholder="Выберите причину расторжения"
      >
        <a-select-option
          v-for="(reason, idx) of terminationReasons"
          :key="idx"
          :value="idx + 1"
        >{{ reason }}</a-select-option>
      </a-select>
    </a-form-model-item>

    <a-form-model-item prop="refund_method" label="Способ получения возврата" v-if="!policy.child">
      <a-select
        v-model="form.refund_method"
        placeholder="Выберите способ"
      >
        <a-select-option
          v-for="(method, idx) of refundMethods"
          :key="idx"
          :value="idx + 1"
        >{{ method }}</a-select-option>
      </a-select>
    </a-form-model-item>

    <div v-if="form.refund_method === 2">
      <a-form-model-item prop="bank_name" label="Наименования банка">
        <a-input
          v-model="form.bank_name"
          placeholder="Введите наименования банка"
        />
      </a-form-model-item>

      <a-form-model-item prop="iban" label="IBAN получателя">
        <a-input
          v-model="form.iban"
          placeholder="Введите IBAN получателя"
        />
      </a-form-model-item>

      <a-form-model-item prop="bin" label="БИН банка">
        <a-input
          v-model="form.bin"
          placeholder="Введите БИН банка"
        />
      </a-form-model-item>

      <a-form-model-item prop="bik" label="БИК (SWIFT код) банка">
        <a-input
          v-model="form.bik"
          placeholder="Введите БИК банка"
        />
      </a-form-model-item>

      <a-form-model-item prop="card_number" label="Номер карты">
        <a-input
          v-model="form.card_number"
          placeholder="Введите номер карты"
        />
      </a-form-model-item>

      <a-form-model-item prop="card_holder" label="Держатель карты">
        <a-input
          v-model="form.card_holder"
          placeholder="Введите держатель карты"
        />
      </a-form-model-item>
    </div>

    <a-divider v-if="!policy.child"/>

    <a-space :size="24">
      <a-button
        type="primary"
        @click="saveForm"
        v-if="policy.status === 8"
      >Сохранить</a-button>

      <a-button
        @click="downloadPdfTerminationStatement"
        v-if="policy.status === 3 && !policy.child"
      >Скачать заявления</a-button>
    </a-space>
  </a-form-model>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { downloadFile } from '@/helpers/fileHelper'

export default {
  props: {
    stepData: Object
  },

  data() {
    return {
      form: {...this.stepData},
      rules: {
        termination_reason: [
          { required: true, message: 'Поле "Причина расторжения" обязательно для заполнения', trigger: 'change'},
        ],
        refund_method: [
          { required: true, message: 'Поле "Способ получения возврата" обязательно для заполнения', trigger: 'change'},
        ],
        bank_name: [
          { required: true, message: 'Поле "Наименование банка" обязательно для заполнения', trigger: 'blur' },
        ],
        iban: [
          { required: true, message: 'Поле "IBAN получателя" обязательно для заполнения', trigger: 'blur' },
        ],
        bin: [
          { required: true, message: 'Поле "BIN банка" обязательно для заполнения', trigger: 'blur' },
        ],
        bik: [
          { required: true, message: 'Поле "SWIFT банка" обязательно для заполнения', trigger: 'blur' },
        ],
        card_number: [
          { required: true, message: 'Поле "Номер карты" обязательно для заполнения', trigger: 'blur' },
        ],
        card_holder: [
          { required: true, message: 'Поле "Держатель карты" обязательно для заполнения', trigger: 'blur' },
        ],
      },
    };
  },

  computed: {
    ...mapState('ogpo', {
      policy: state => state.policy,
      terminationReasons: state => state.terminationReasons,
      refundMethods: state => state.refundMethods,
    })
  },

  methods: {
    ...mapMutations('ogpo', [
      'SET_POLICY',
      'SET_STEP_DATA',
    ]),

    ...mapActions('ogpo', [
      'terminatePolicy',
      'getPdfDocument',
    ]),

    async downloadPdfTerminationStatement() {
      let rp = await this.getPdfDocument({ document_type: 'statement_termination' });

      if (rp.success) {
        downloadFile(rp.data.filename, 'data:application/octet-stream;base64,' + rp.data.file);
      } else {
        this[rp.dialog]({ title: rp.message });
      }
    },

    saveForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          let rp = await this.terminatePolicy({
            id: this.policy.id,
            ...this.form
          });

          if (rp.success) {
            this.SET_POLICY({
              ...this.policy,
              ...this.form,
              status: 3,
            });
            this.SET_STEP_DATA({
              step: 5,
              data: this.form
            });

            this.$success({ title: rp.message });
          } else {
            this.$error({ title: rp.message });
          }
        }
      });
    },
  }
}
</script>
