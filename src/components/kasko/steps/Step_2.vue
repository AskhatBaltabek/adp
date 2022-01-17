<template>
  <div>
    <a-row :gutter="[0,12]">
      <a-col>
        <a-space :size="24" style="align-items: flex-end">
          <div class="tarif__filter--select_wrapper">
          </div>
        </a-space>
      </a-col>
      <a-col>
        <a-table
            v-for="table in tarifes"
            :key="table[0].product_title"
            :pagination="false"
            :columns="columns"
            :data-source="table"
            :rowKey="(r,i)=>i"
            size="small"
            :rowClassName="rowClassName"
            bordered
        >
          <template slot="title">
            <h3>{{ table[0].product_title }}</h3>
          </template>
          <template slot="percent" slot-scope="value">
            {{ value | numeral('0.[00]%') }}
          </template>
          <template slot="sum" slot-scope="value">
            {{ value | numeral }}
          </template>
          <template slot="amortization" slot-scope="value">
            {{ value ? "С амортизацией" : "Без амортизации" }}
          </template>
          <template slot="action" slot-scope="id, r">
            <a-button size="small" type="link" @click="()=>print(r)">Скачать КП</a-button>
            <a-divider type="vertical" />
            <a-button size="small" type="link" @click="()=>save(current+1, r)">Расчитать</a-button>
          </template>
        </a-table>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";
import { downloadFile } from "@/helpers/fileHelper";

const columns = [
  {
    title: 'Тариф',
    dataIndex: 'tarif',
    scopedSlots: { customRender: 'percent' },
  },
  {
    title: 'Премия',
    dataIndex: 'premium',
    scopedSlots: { customRender: 'sum' }
  },
  {
    title: 'Амортизация',
    dataIndex: 'without_amortization',
    scopedSlots: { customRender: 'amortization' }
  },
  {
    title: 'Франшиза (Повреждение)',
    dataIndex: 'franchise_damage',
  },
  {
    title: 'Франшиза (Утрата)',
    dataIndex: 'franchise_loss',
  },
  {
    title: '',
    dataIndex: 'id',
    key: 'operation',
    fixed: 'right',
    width: 250,
    scopedSlots: { customRender: 'action' },
  }
];

export default {
  props: {
    stepData: Object
  },
  data() {
    return {
      data: Object.assign({}, this.stepData),
      columns,
      rules: {
      },
      selectedTariffs: [],
    }
  },
  mounted() {
    this.$store.dispatch('LOAD_TARIFES')
  },
  methods: {
    rowClassName(r) {
      return r.id === this.data.id ? 'selected-row' : '';
    },
    print(data) {
      let car = this.getStepByField('component', 'Step_1').data;

      let key = '';
      switch (data.product_code) {
        case 200:
          key = 'kasko_commercial_offer'
          break
        case 206:
          key = 'grand_kasko_commercial_offer'
          break
        case 203:
          key = 'extra_kasko_commercial_offer'
          break
      }

      let params = {
        key,
        config: {
          orientation: 'L',
          mode: 'utf-8',
        },
        data: {
          car: {
            mark: this.mark(car.mark).title,
            model: this.model(car.model).title,
            born: car.year,
            insurance_sum: car.sum,
            premium: car.sum * data.tarif
          },
          product_name: 'KACKO',
          options: {
            tarif: data.tarif,
          },
          franchise_loss: data.franchise_loss,
          franchise_damage: data.franchise_damage,
        }
      };
      this.$store.dispatch('PRINT_COMPRED', params)
        .then(resp => {
          downloadFile(resp.data.data.fileName, 'data:application/octet-stream;base64,' + resp.data.data.file)
        });
    },
    handleSubmit() {
    },
    save(current, r) {
      this.data = {...this.data, ...r}
      this.$store.dispatch('SAVE_STEP_DATA', this.data)
          .then(() => {
            this.$store.dispatch('CHANGE_STEP', current)
          });
    }
  },
  computed: {
    ...mapState({
      current: state => state.kasko.currentStep,
      tarifes: state => state.kasko.tarifes,
      selectedTarif: state => state.kasko.selectedTarif,
    }),
    ...mapGetters(['getStepByField', 'mark', 'model']),
    rowSelection() {
      return {
        onChange: (keys, rows) => {
          this.selectedTariffs = Object.assign({}, rows)
        },
        getCheckboxProps: record => ({
          props: {
            name: record.name,
          },
        }),
      };
    },
  }
}
</script>

<style lang="scss">
.tarif {
  &__filter {
    &--select_wrapper {
      display: flex;
      flex-direction: column;
    }
    &--select {
      width: 250px;
    }
  }
}
tr.selected-row {
  background-color: blanchedalmond;
}
</style>