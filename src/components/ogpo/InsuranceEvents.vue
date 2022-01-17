<template>
  <div class="insurance-events">
    <h1>Список страховых случаев:</h1>
    <a-table
      :columns="columns"
      :data-source="insuranceEvents"
      row-key="ie_id"
      :pagination="false"
    >
      <a-table
        slot="expandedRowRender"
        slot-scope="record"
        :columns="innerColumns"
        :data-source="record.victim_objects"
        row-key="victim_object_id"
        :pagination="false"
      >
      </a-table>
    </a-table>
  </div>
</template>

<script>
export default {
  props: {
    insuranceEvents: Array
  },

  data() {
    return {
      columns: [
        { title: 'ID страхового случая', dataIndex: 'ie_id', key: 'ie_id' },
        { title: 'Дата СС', dataIndex: 'ie_date', key: 'ie_date' },
        { title: 'ID Заявителя', dataIndex: 'proposer_id', key: 'proposer_id' },
        { title: 'Дата заявления', dataIndex: 'statement_date', key: 'statement_date' },
        { title: 'Описание', dataIndex: 'description', key: 'description' }
      ],
      innerColumns: [
        { title: 'ID пострадавшего объекта', dataIndex: 'victim_object_id', key: 'victim_object_id' },
        { title: 'Пострадавший объект', dataIndex: 'victim_object', key: 'victim_object' },
        { title: 'ID Выгодоприобретателя', dataIndex: 'client_id', key: 'client_id' },
        { title: 'Выплата', dataIndex: 'benefit_payment', key: 'benefit_payment' },
        { title: 'Дата выплаты', dataIndex: 'benefit_payment_date', key: 'benefit_payment_date' },
      ]
    };
  },
};
</script>

<style lang="scss">
.insurance-events {
  margin-top: 25px;
}
</style>
