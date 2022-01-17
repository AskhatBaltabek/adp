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
      <a-form-model-item prop="range" label="Срок полиса">
        <a-radio-group :disabled="!policyDraft" @change="handleChangeRangeStartDate" v-model="data.range" button-style="solid">
          <a-radio-button :value="0">
            Одноразовая
          </a-radio-button>
          <a-radio-button v-for="range in multiRanges" :value="range.id" :key="range.id">
            на {{ range.range_days }} дней
          </a-radio-button>
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item prop="countries" label="Территория">
        <a-select
            :loading="loading"
            mode="multiple"
            show-search
            :default-active-first-option="false"
            :filter-option="filterOption"
            v-model="data.countries"
            style="width: 400px"
            name="countries"
            @change="value => handleChangeGoalOrCountry(value, 'countries')"
            :disabled="!policyDraft"
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
            :disabled="!policyDraft"
        >
          <a-select-option v-for="purpose in purposes" :key="purpose.id">{{purpose.title}}</a-select-option>
        </a-select>
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
            @change="handleChangeEndDate"
            style="width:195px"
            :disabled="isRange || !policyDraft"
        />
      </a-form-model-item>
      <a-form-model-item v-if="isRange" prop="insured_days" label="Кол.во дней">
        <a-input-number :disabled="!policyDraft" v-model="data.insured_days" :min="data.minInsuredDays" :max="data.maxInsuredDays" />
        <div class="ant-form-explain">Минимум: {{data.minInsuredDays}} - Максимум: {{data.maxInsuredDays}}</div>
      </a-form-model-item>
      <a-form-model-item prop="amount_sum" label="Страховая сумма">
        <a-select
            :loading="loading"
            show-search
            :default-active-first-option="false"
            :filter-option="filterOption"
            v-model="data.amount_sum"
            style="width: 400px"
            :disabled="!policyDraft"
        >
          <a-select-option v-for="sum in filteredAmountSums(data)" :key="sum.title">{{sum.title | numeral}}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="Доп. опции">
        <a-tooltip placement="top">
          <template slot="title">
            <span>Франшиза: <b>50 евро</b></span>
          </template>
          <a-checkbox :disabled="!policyDraft" v-model="data.without_franchise" name="type">
            Без франшизы
          </a-checkbox>
        </a-tooltip>
        <a-checkbox :disabled="!policyDraft" v-model="data.covid" value="2" name="type">
          COVID
        </a-checkbox>
        <a-checkbox :disabled="!policyDraft" v-model="data.is_active" name="type">
          Активный отдых
        </a-checkbox>
      </a-form-model-item>
      <a-form-model-item
          v-for="(client, index) in data.clients"
          :prop="'clients.'+index"
          :key="index"
          v-bind="index === 0 ? '' : formItemLayoutWithOutLabel"
          :label="index === 0 ? 'Застрахованные' : ''"
          :rules="[{required: true, message: 'Заполните поле',validator: validateClients, trigger: ['change', 'blur']}]"
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
        <a-button :disabled="nextButtonDisabled" icon="caret-right" @click="()=>save(current+1)">Далее</a-button>
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
    stepData: Object
  },
  components: {
    AmountTable
  },
  data() {
    let validatePeriod = (rule, value, callback) => {
      if(!value.date_begin) {
        callback(new Error(rule.startDateMessage))
      } else if (!value.date_end) {
        callback(new Error(rule.endDateMessage))
      }
      callback()
    };
    return {
      validateClients(rule, value, callback) {
        if(!value.born) callback(new Error())

        callback()
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
        range: [
          {required: true, message: "Выберите срок полиса"}
        ],
        period: [
          {
            required: true,
            startDateMessage: "Заполните дату начала",
            endDateMessage: "Заполните дату окончания",
            validator: validatePeriod,
            trigger: ['change', 'blur']
          }
        ],
        insured_days: [
          {required: true, message: "Заполните кол.во дней"}
        ],
        countries: [
          {required: true, message: "Выберите стран"}
        ],
        purpose: [
          {required: true, message: "Выберите цель поездки"}
        ],
        amount_sum: [
          {required: true, message: "Выберите страховую сумму"}
        ],
      }
    }
  },

  methods: {
    disabledStartDate(value) {
      return value < moment().startOf('day');
    },
    disabledEndDate(value) {
      let disabled = true

      if(!this.data.period.date_begin) return disabled

      return value < this.data.period.date_begin.clone().add(this.minPeriod, 'days')
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
      if(this.isRange) {
        let days = this.multiRanges.find(r => r.id === this.data.range)
        this.data.minInsuredDays = days.min_days
        this.data.maxInsuredDays = days.max_days
        this.$set(this.data, 'insured_days', days.min_days)
        if (this.data.period.date_begin) {
          this.data.period.date_end = this.data.period.date_begin.clone().add(days.range_days-1, 'd')
        }
      } else {
        this.$set(this.data, 'insured_days', 0)

      }
    },
    handleChangeEndDate() {
      this.$refs.form.validate(valid => valid)
    },
    handleChangeGoalOrCountry(value, item) {
      this.$set(this.data, 'amount_sum', null)

      if(item === 'purposes') {
        this.$set(this.data, 'insured_days', 0)
        this.$set(this.data.period, 'date_begin', null)
        this.$set(this.data.period, 'date_end', null)

      }
    },
    async calculate() {
      this.$refs.form.validate(async valid => {
        /* Костыль. Потом исправить */
        if (valid && this.data.period.date_end) {
          try {
            await this.$store.dispatch('mst/SAVE_STEP_DATA', {data: this.data});
          } catch(e) {
            this.$message.error(e.response.data.message)
            return false;
          }

          try {
            let resp = await this.$store.dispatch('mst/GET_PREMIUM', this.data.clients)

            this.$message.success(resp.message)
            this.nextButtonDisabled = false;
          } catch(e) {
            console.log(e)
            this.$message.error(e.response ? e.response.data.message : 'Ошибка!')
          }

        } else {
          this.$message.error('Проверьте форму заполнения!')
          return false;
        }
      })
    },
    save(next) {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$store.dispatch('mst/SAVE_STEP_DATA', {data: this.data})
            .then(() => {
              this.$message.success('Сохранено!');
              this.$store.dispatch('mst/CHANGE_STEP', next)
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
  mounted() {
  },
  computed: {
    ...mapGetters(['userAgents', 'isManager', 'isAgent']),
    ...mapState('mst', {
      loading: state => state.loading,
      current: state => state.currentStep,
      countries: state => state.countries,
      multiRanges: state => state.multiRanges,
      purposes: state => state.purposes,
    }),
    isRange() {
      return this.data.range !== 0
    },
    ...mapGetters('mst', ['filteredAmountSums', 'policyDraft'])
  },
}
</script>

<style>
</style>