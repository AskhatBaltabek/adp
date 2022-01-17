<template>
  <div class="esbd-policies">
    <h1>Список полисов ОС ГПО ВТС Страхователя за последние три года в ЕСБД:</h1>
    <a-table
      :columns="columns"
      :data-source="policies"
      row-key="policy_id"
      :pagination="false"
    >
      <a-table
        slot="expandedRowRender"
        slot-scope="record"
        :columns="innerColumns"
        :data-source="record.policiestf"
        row-key="tf_id"
        :pagination="false"
      >
        <span slot="tf_type_id" slot-scope="text">{{ getVehicleTypesObject[text] }}</span>
        <span slot="region_id" slot-scope="text">{{ getRegionsObject[text] }}</span>
        <span slot="big_city_bool" slot-scope="value">{{ value > 0 ? 'Да' : 'Нет' }}</span>
        <span slot="insurance_premium" slot-scope="value">{{ value > 0 ? value : '-' }}</span>
      </a-table>
    </a-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    policies: Array
  },

  data() {
    return {
      columns: [
        { title: 'ID полиса', dataIndex: 'policy_id', key: 'policy_id' },
        { title: 'Номер полиса', dataIndex: 'policy_number', key: 'policy_number' },
        { title: 'Дата выписки', dataIndex: 'policy_date', key: 'policy_date' },
        { title: 'Дата начала', dataIndex: 'date_beg', key: 'date_beg' },
        { title: 'Дата окончания', dataIndex: 'date_end', key: 'date_end' },
        { title: 'Роль', dataIndex: 'policy_role', key: 'policy_role' },
        {
          title: 'Страховая премия',
          dataIndex: 'insurance_premium',
          key: 'insurance_premium',
          scopedSlots: { customRender: 'insurance_premium' },
        },
      ],
      innerColumns: [
        { title: 'ID ТС', dataIndex: 'tf_id', key: 'tf_id' },
        { title: 'Гос. номер', dataIndex: 'tf_number', key: 'tf_number' },
        { title: 'VIN', dataIndex: 'vin', key: 'vin' },
        { title: 'Год выпуска', dataIndex: 'born', key: 'born' },
        {
          title: 'Тип ТС',
          dataIndex: 'tf_type_id',
          key: 'tf_type_id',
          scopedSlots: { customRender: 'tf_type_id' },
        },
        {
          title: 'Регион регистрации',
          dataIndex: 'region_id',
          key: 'region_id',
          scopedSlots: { customRender: 'region_id' },
        },
        {
          title: 'Областной центр',
          dataIndex: 'big_city_bool',
          key: 'big_city_bool',
          scopedSlots: { customRender: 'big_city_bool' },
        },
      ]
    };
  },

  computed: {
    ...mapGetters('ogpo', [
      'getVehicleTypesObject',
      'getRegionsObject'
    ])
  }
};
</script>

<style lang="scss">
.esbd-policies {
  margin-top: 25px;
}
</style>
