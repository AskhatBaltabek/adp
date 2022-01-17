<template>
  <a-table
      bordered
      :columns="columns"
      :data-source="clients"
      :rowKey="(r,i)=>i"
      :pagination="false"
      v-if="clients"
  >
    <template slot="dataRender" slot-scope="value">
      {{ value.format('DD.MM.YYYY') }}
    </template>
    <template slot="sumRender" slot-scope="value">
      <b>{{value | numeral}}</b> тг.
    </template>
    <template slot="footer">
      <h3 style="text-align:right">Итого: <b>{{total.premium | numeral}}</b> тг.</h3>
    </template>
  </a-table>
</template>

<script>
import {mapState} from "vuex";

export default {
  data() {
    return {
      columns: [
        {
          title: 'ФИО',
          dataIndex: 'fio',
          type: 'text',
        },
        {
          title: 'ИИН',
          dataIndex: 'iin',
          type: 'text',
        },
        {
          title: 'Возраст',
          dataIndex: 'age',
          type: 'text',
        },
        {
          title: 'Премия(тг.)',
          dataIndex: 'premium',
          type: 'text',
          scopedSlots: {
            customRender: 'sumRender',
          },
        },
      ],
    }
  },
  methods: {

  },
  mounted() {
  },
  computed: {
    ...mapState('autoshop', {
      clients: state => state.premium.clients,
      total: state => state.premium.total
    })
  }
}
</script>