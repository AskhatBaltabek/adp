<template>
  <div>
    <a-form-model
        ref="form"
        :rules="rules"
        style="width: 700px"
        :label-col="{ span:5 }"
        :wrapper-col="{ span: 16 }"
        :model="data"
        @submit.native.prevent
        v-bind="formItemLayoutWithOutLabel"
    >
      <a-form-model-item v-if="isManager" prop="agent_id_1c" label="Агент">
        <a-select
            :loading="loading"
            show-search
            :default-active-first-option="false"
            :filter-option="filterOption"
            v-model="data.agent_id_1c"
            style="width: 400px"
            label="Агент"
            :disabled="!policyDraft"
        >
          <a-select-option v-for="agent in userAgents" :key="agent.id_1c">
            {{ agent.name }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item prop="countries" label="Территория">
        <a-select
            :loading="loading"
            mode="multiple"
            show-search
            :default-active-first-option="false"
            :filter-option="filterOption"
            :disabled="true"
            v-model="data.countries"
            style="width: 400px"
            name="countries"
            @change="value => handleChangeGoalOrCountry(value, 'countries')"
        >
          <a-select-option v-for="country in countries.filter(c => c.country_id !== 1)" :key="country.alpha_code">
            {{country.title}}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item prop="purpose" label="Цель поездки">
        <a-select
            :loading="loading"
            show-search
            :default-active-first-option="false"
            :filter-option="filterOption"
            v-model="data.purpose"
            style="width: 400px"
            name="purposes"
            @change="value => handleChangeGoalOrCountry(value, 'purposes')"
            :disabled="true"
        >
          <a-select-option v-for="purpose in purposes" :key="purpose.id">{{purpose.title}}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item prop="table" label="Тарифы">
        <a-table :rowSelection="rowSelection" :rowKey="r => r.premium" :pagination="false" :columns="columns" :data-source="tarifes">
          <template slot="euro" slot-scope="value">
            {{ value }} €
          </template>
        </a-table>
      </a-form-model-item>
      <a-form-model-item prop="period" label="Период">
        <a-date-picker
            v-model="data.period.date_begin"
            :format="dateFormat"
            placeholder="Дата начала"
            :disabled-date="disabledStartDate"
            @change="handleChangeRangeStartDate"
            style="width:195px;margin-right:10px;"
            :disabled="!policyDraft"
        />
        <a-date-picker
            v-model="data.period.date_end"
            :format="dateFormat"
            placeholder="Дата окончания"
            :disabled-date="disabledEndDate"
            style="width:195px"
            :disabled="true"
        />
      </a-form-model-item>
      <a-form-model-item
          v-for="(client, index) in data.clients"
          :prop="'clients.'+index"
          :key="index"
          v-bind="index === 0 ? '' : formItemLayoutWithOutLabel"
          :label="index === 0 ? 'Застрахованные' : ''"
          :rules="[{required: true, message: 'Заполните поле или удалите'}]"
      >
        <a-input style="width: 400px; margin-right: 8px" v-mask="'##.##.####'" placeholder="Дата рождения" :disabled="!policyDraft" v-model="client.born" />
        <a-icon
            v-if="data.clients.length > 1"
            class="dynamic-delete-button"
            type="minus-circle-o"
            :disabled="data.clients.length === 1"
            @click="removeClient(client)"
        />
      </a-form-model-item>
      <a-form-model-item v-bind="formItemLayoutWithOutLabel">
        <a-button :disabled="!policyDraft" type="dashed" style="width: 400px" @click="addClient">
          <a-icon type="plus-circle" /> Добавить клиента
        </a-button>
      </a-form-model-item>
      <a-divider />
      <amount-table></amount-table>
      <a-divider />
      <a-space :size="24">
        <a-button type="primary" icon="calculator" @click="()=>calculate()">Рассчитать</a-button>
        <a-button type="primary" :disabled="nextButtonDisabled" icon="caret-right" @click="()=>save(current+1)">Далее</a-button>
      </a-space>
    </a-form-model>
  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";
import {cloneDeep} from 'lodash'
import AmountTable from "../AmountTable";
import moment from 'moment/src/moment'
import {mask} from 'vue-the-mask'

export default {
  directives: {mask},
  props: {
    stepData: Object,
  },
  components: {
    AmountTable
  },
  data() {
    let validatePeriod = (rule, value, callback) => {
      if(!value.date_begin) {
        callback(new Error(rule.startDateMessage))
      }
      callback()
    };
    return {
      columns: [
        {
          title: 'Срок страхования(дней)',
          dataIndex: 'insurance_period',
          type: 'number',
        },
        {
          title: 'Срок страховой защиты(дней)',
          dataIndex: 'insured_days',
          type: 'number',
        },
        {
          title: 'Страховая сумма',
          dataIndex: 'insured_sum',
          type: 'number',
          scopedSlots: {
            customRender: 'euro',
          },
        },
        {
          title: 'Франшиза',
          dataIndex: 'franchise',
          type: 'number',
          scopedSlots: {
            customRender: 'euro',
          },
        },
        {
          title: 'Премия',
          dataIndex: 'premium',
          type: 'number',
          scopedSlots: {
            customRender: 'euro',
          },
        },
      ],
      selectedTariff: null,
      rowSelection: {
        type: 'radio',
        onChange: async (selectedRowKeys, selectedRows) => {
          await this.$set(this.rowSelection, 'selectedRowKeys', selectedRowKeys)
          await this.$set(this, 'selectedTariff', selectedRows[0])
          this.$set(this.data, 'amount_sum', this.selectedTariff.insured_sum)
          this.handleChangeRangeStartDate()
        },
        getCheckboxProps: record => ({
          props: {
            disabled: record.name === 'Disabled User', // Column configuration not to be checked
            name: record.name,
          },
        }),
      },
      nextButtonDisabled: true,
      termDisabled: 0,
      minPeriod: 0,
      maxPeriod: 365,
      formItemLayout: {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 4 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 20 },
        },
      },
      formItemLayoutWithOutLabel: {
        wrapperCol: {
          xs: { span: 5, offset: 0 },
          sm: { span: 20, offset: 5 },
        },
      },
      dateFormat: "DD.MM.YYYY",
      data: cloneDeep(this.stepData),
      rules: {
        period: [
          {
            required: true,
            startDateMessage: "Заполните дату начала",
            endDateMessage: "Заполните дату окончания",
            validator: validatePeriod,
            trigger: ['change', 'blur']
          }
        ],
      }
    }
  },

  methods: {
    calculate() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$store.dispatch('autoshop/SAVE_STEP_DATA', {data: this.data})
              .then(() => {
                this.$store.dispatch('autoshop/GET_PREMIUM', this.data.clients)
                    .then(resp => {
                      this.nextButtonDisabled = false;
                      if(resp.success) this.$message.success(resp.message)
                      else this.$message.error(resp.message)
                    })
                    .catch(e => {
                      this.$message.error(e.message)
                    })
              })
              .catch(e => {
                this.$message.error(e.response.data.message)
              })
        } else {
          this.$message.error('Проверьте форму заполнения!')
          return false;
        }
      })
    },
    disabledStartDate(value) {
      return value < moment().startOf('day');
    },
    disabledEndDate(value) {
      let disabled = true

      if(!this.data.period.date_begin) return disabled

      if(this.data.purpose === 3)
        return value < this.data.period.date_begin.clone().add(this.minPeriod, 'days')
      else
        return false
    },
    filterOption(input, option) {
      return (
          option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    addClient() {
      this.data.clients.push({
        born: null,
      });
    },
    removeClient(item) {
      let index = this.data.clients.indexOf(item);
      if (index !== -1) {
        this.data.clients.splice(index, 1);
      }
    },
    handleChangeRangeStartDate() {
        if(this.selectedTariff) {
          let days = this.selectedTariff.insurance_period
          this.$set(this.data, 'insured_days', this.selectedTariff.insured_days)
          if (this.data.period.date_begin) {
            this.data.period.date_end = this.data.period.date_begin.clone().add(days-1, 'd')
          }
        }
    },
    handleChangeGoalOrCountry(value, item) {
      this.$set(this.data, 'amount_sum', null)

      if(item === 'purposes') {
        this.$set(this.data, 'insured_days', 0)
        this.$set(this.data.period, 'date_begin', null)
        this.$set(this.data.period, 'date_end', null)
      }
    },
    save(next) {
      this.data.insured_days = this.selectedTariff.insured_days
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$store.dispatch('autoshop/SAVE_STEP_DATA', {data: this.data})
            .then(() => {
              this.$message.success('Сохранено!');
              this.$store.dispatch('autoshop/CHANGE_STEP', next)
            })
            .catch(e => {
              this.$message.error(e.response.data.message)
            })
        } else {
          return false;
        }
      })
    },
  },
  computed: {
    ...mapGetters(['userAgents', 'isManager', 'isAgent']),
    ...mapState('autoshop', {
      loading: state => state.loading,
      current: state => state.currentStep,
      countries: state => state.countries,
      multiRanges: state => state.multiRanges,
      purposes: state => state.purposes,
      tarifes: state => state.tarifes
    }),
    isRange() {
      return this.data.range !== 0
    },
    ...mapGetters('autoshop', ['filteredAmountSums', 'policyDraft'])
  },
  async mounted() {
    await this.$set(this, 'selectedTariff', this.tarifes ? this.tarifes.find(r => r.premium === this.data.premium) : null)
    this.$set(this.rowSelection, 'selectedRowKeys', this.selectedTariff ? [this.selectedTariff.premium] : [0])
  }
}
</script>

<style>
</style>