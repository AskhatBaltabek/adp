<template>
  <div class="client-unprofitableness">
    <a-table
      :columns="columns"
      :data-source="rows"
      row-key="date_begin"
      :pagination="false"
    >
    </a-table>
    <h1 style="margin-top: 25px" v-if="!!rows.length">Значение: {{ agentCommission }}</h1>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  props: {
    clientId: Number,
  },

  data() {
    return {
      columns: [
        { title: 'Дата начала', dataIndex: 'date_begin', key: 'date_begin' },
        { title: 'Дата окончания', dataIndex: 'date_end', key: 'date_end' },
        { title: 'Количество полисов', dataIndex: 'policies_count', key: 'policies_count' },
        { title: 'Сумма премий', dataIndex: 'insurance_premiums_amount', key: 'insurance_premiums_amount' },
        { title: 'Количество страховых случаев', dataIndex: 'insurance_events_count', key: 'insurance_events_count' },
        { title: 'Сумма выплат', dataIndex: 'benefit_payments_amount', key: 'benefit_payments_amount' },
        { title: 'Количество выплат', dataIndex: 'benefit_payments_count', key: 'benefit_payments_count' },
      ],
      rows: [],
      agentCommission: 0
    };
  },

  methods: {
    ...mapActions('ogpo', [
      'getVehicleTypes',
      'getRegions',
      'searchClient',
      'getPoliciesByClient',
      'getInsuranceEvents',
      'calculateUnprofitableness',
    ]),

    async getCalculatedData() {
      let rp = await this.calculateUnprofitableness({ 'client_id': this.clientId });

      if (rp.success) {
        this.$message.success(rp.message);

        this.rows = rp.data.data_by_year;
        this.agentCommission = rp.data.agent_commission;
      } else {
        this[rp.dialog]({ title: rp.message });
      }
    }
  },

  mounted() {
    this.getCalculatedData();
  }
}
</script>
