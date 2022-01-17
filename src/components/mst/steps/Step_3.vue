<template>
  <div>
    <a-button :disabled="!policyDraft" type="primary" icon="plus-circle" @click="add">Добавить</a-button>
    <a-divider />
    <a-tabs size="small" v-model="currentTab" :hide-add="true" type="editable-card" @edit="onEdit">
      <a-tab-pane
        v-for="(client,targetKey) in data"
        :key="targetKey"
        :tab="!isEmpty(client) && client.first_name ? client.first_name+' '+client.last_name : 'Застрахованный ' + (targetKey+1)"
        :closable="policyDraft">
        <a-form-model
            :ref="`form${targetKey}`"
            :rules="rules"
            style="width: 700px"
            :label-col="{ span:5 }"
            :wrapper-col="{ span: 16 }"
            :model="client"
            @submit.native.prevent
            v-bind="formItemLayoutWithOutLabel"
        >
          <a-form-model-item prop="is_holder" v-bind="formItemLayoutWithOutLabel" style="display:none">
            <a-checkbox :disabled="!policyDraft" v-model="client.is_holder" :checked="true" name="is_holder">
              Застрахованный
            </a-checkbox>
          </a-form-model-item>
          <a-form-model-item v-bind="formItemLayoutWithOutLabel">
            <a-checkbox :disabled="!policyDraft" v-model="client.resident_bool" :value="1" name="type">
              Резидент
            </a-checkbox>
          </a-form-model-item>
          <a-form-model-item v-if="client.resident_bool" prop="iin" label="ИИН">
            <a-input-search :disabled="!policyDraft" style="width: 400px" v-model="client.iin" placeholder="Введите ИИН" @search="onSearchClient" enter-button="Поиск"/>
          </a-form-model-item>
          <a-form-model-item prop="country_code" label="Страна резид.ва">
            <a-select
              :loading="loading"
              show-search
              :default-active-first-option="false"
              :filter-option="filterOption"
              v-model="client.country_code"
              style="width: 400px"
              :disabled="!policyDraft"
            >
              <a-select-option v-for="country in countries" :key="country.alpha_code">
                {{country.title}}
              </a-select-option>
            </a-select>
          </a-form-model-item>
          <div class="item-wrap">
            <a-form-model-item prop="document_type_id" label="Тип документа">
              <a-select :disabled="!policyDraft" placeholder="Выберите тип документа" style="width: 400px" v-model="client.document_type_id">
                <a-select-option v-for="type in documentTypes" :key="type.id" :value="type.esbd_id">{{type.title}}</a-select-option>
              </a-select>
            </a-form-model-item>
            <a-form-model-item prop="document_number" label="Номер документа">
              <a-input :disabled="!policyDraft" style="width: 400px" v-model="client.document_number" placeholder="Введите номер документа"/>
            </a-form-model-item>
            <a-form-model-item prop="document_gived_date" label="Дата выдачи док.">
              <a-input v-mask="'##.##.####'" :disabled="!policyDraft" style="width: 400px" v-model="client.document_gived_date" placeholder="Дата выдачи документа"/>
            </a-form-model-item>
            <a-form-model-item prop="document_gived_by" label="Кем выдан">
              <a-input :disabled="!policyDraft" style="width: 400px" v-model="client.document_gived_by" placeholder="Введите номер документа"/>
            </a-form-model-item>
          </div>
          <a-form-model-item prop="last_name" label="Фамилия">
            <a-input :disabled="!policyDraft" style="width: 195px;" v-model="client.last_name" placeholder="Введите фамилию"/>
            <a-input :disabled="!policyDraft" style="width: 195px;margin-left:10px" v-model="client.last_name_eng" placeholder="на латинице"/>
          </a-form-model-item>
          <a-form-model-item prop="first_name" label="Имя">
            <a-input :disabled="!policyDraft" style="width: 195px" v-model="client.first_name" placeholder="Введите имя"/>
            <a-input :disabled="!policyDraft" style="width: 195px;margin-left:10px" v-model="client.first_name_eng" placeholder="на латинице"/>
          </a-form-model-item>
          <a-form-model-item prop="middle_name" label="Отчество">
            <a-input :disabled="!policyDraft" style="width: 195px" v-model="client.middle_name" placeholder="Введите отчество"/>
            <a-input :disabled="!policyDraft" style="width: 195px;margin-left:10px" v-model="client.middle_name_eng" placeholder="на латинице"/>
          </a-form-model-item>
          <div class="item-wrap">
            <a-form-model-item prop="born" label="Дата рождения">
              <a-input v-mask="'##.##.####'" :disabled="!policyDraft" style="width: 400px" v-model="client.born" placeholder="Дата рождения"/>
            </a-form-model-item>
            <a-form-model-item prop="sex_id" label="Пол">
              <a-select :disabled="!policyDraft" placeholder="Выберите пол" style="width: 400px" v-model="client.sex_id">
                <a-select-option :key="1" :value="1">Муж.</a-select-option>
                <a-select-option :key="2" :value="2">Жен.</a-select-option>
              </a-select>
            </a-form-model-item>
            <a-form-model-item prop="address" label="Адрес">
              <a-input :disabled="!policyDraft" style="width: 400px" v-model="client.address" placeholder="Введите адрес"/>
            </a-form-model-item>
          </div>
          <a-divider />
          <a-space :size="24">
            <a-button :disabled="!policyDraft" type="primary" @click="()=>save(current)" icon="save">Сохранить</a-button>
          </a-space>
        </a-form-model>
      </a-tab-pane>
    </a-tabs>
    <a-divider />
    <amount-table />
    <a-divider />
    <template v-if="!policyDraft">
      <h3 v-if="!policyCanceled">Полис выписан. Номер договора: <b>{{policy_number}}</b></h3>
      <h3 v-else>Полис отмечен "Ошибкой оператора". Номер договора: <b>{{policy_number}}</b></h3>
    </template>
    <a-divider />
    <a-space :size="24">
      <a-button icon="caret-left" :disabled="current === 0" @click="()=>save(current-1)">Пред.</a-button>
      <template v-if="policyDraft">
        <a-button type="primary" @click="()=>calculate()" icon="calculator">Рассчитать</a-button>
        <a-button type="primary" :disabled="disabledSavePolicy" @click="()=>setPolicy(true)" icon="container">Сохранить черновик</a-button>
        <a-button type="primary" :disabled="disabledSavePolicy" @click="()=>setPolicy(false)" icon="form">Выписать полис</a-button>
      </template>
      <template v-else>
        <a-button type="danger" v-if="!policyCanceled" @click="()=>cancelPolicy()" icon="close-circle">Ошибка оператора</a-button>
        <a-button type="disabled" disabled v-else icon="close-circle">Отмечен ошибкой оператора</a-button>
        <a-button type="primary" @click="()=>downloadFile('form')" icon="printer">Распечатать анкету</a-button>
        <a-button type="primary" @click="()=>downloadFile('contract')" icon="printer">Распечатать договор</a-button>
      </template>
    </a-space>
  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex"
import {isEmpty,cloneDeep} from 'lodash'
import AmountTable from "../AmountTable"
import {downloadFile} from "@/helpers/fileHelper";
import {mask} from 'vue-the-mask'

export default {
  directives: {mask},
  props: {
    stepData: Array[Object]
  },
  components: {
    AmountTable
  },
  data() {
    return {
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
      currentTab: 0,
      prevTab: 0,
      disabledSavePolicy: true,
      rules: {
        iin: [
          {required: true, message: "Заполните ИИН"}
        ],
        document_type_id: [
          {required: true, message: "Выберите тип документа"}
        ],
        document_number: [
          {required: true, message: "Заполните номер документа"}
        ],
        document_gived_date: [
          {required: true, message: "Заполните дату выдачи документа"}
        ],
        document_gived_by: [
          {required: true, message: "Заполните кем выдан документ"}
        ],
        last_name: [
          {required: true, message: "Заполните фамилию"}
        ],
        first_name: [
          {required: true, message: "Заполните имя"}
        ],
        born: [
          {required: true, message: "Заполните дату рождения"}
        ],
        sex_id: [
          {required: true, message: "Выберите пол"}
        ],
        address: [
          {required: true, message: "Заполните адрес"}
        ],
        mobile_phone: [
          {required: true, message: "Заполните телефон"}
        ],
        country_code: [
          {required: true, message: "Укажите страну резидентства"}
        ],
      }
    }
  },
  async mounted() {
    await this.$store.dispatch('mst/LOAD_DOCUMENT_TYPES');
  },
  methods: {
    onEdit(targetKey, action) {
      this[action](targetKey)
    },
    isEmpty(data) {
      return isEmpty(data)
    },
    validAll() {
      let validAll = false
      for (let index in this.$refs) {
        if(!this.$refs[index][0]) continue

        this.$refs[index][0].validate(valid => {
          validAll = valid
          if (valid) {
            this.$set(this, 'currentTab', this.data.length - 1)
          } else {
            return false;
          }
        });
      }
      return validAll
    },
    filterOption(input, option) {
      return (
          option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    async add() {
      if(this.validAll()) {
        this.data.push({is_holder: true, resident_bool: false})
      }
    },
    async downloadFile(type) {
      let result = await this.$store.dispatch('mst/GET_TEMPLATE', {policy_number: this.policy_number, type})

      downloadFile(result.fileName, 'data:application/octet-stream;base64,' + result.data)
    },
    remove(targetKey) {
      this.data.splice(targetKey, 1);
      delete this.$refs['form'+targetKey]
      this.$set(this, 'currentTab', (targetKey === this.prevTab ? this.data.length-1 : this.prevTab))
    },
    onSearchClient(value) {
      this.$store.dispatch('mst/SEARCH_CLIENT', {iin: value, natural_person_bool: 1, resident_bool: this.data[this.currentTab].resident_bool ? 1 : 0})
        .then(resp => {
          resp.phone = resp.mobile_phone
          resp.resident_bool = !!resp.resident_bool
          resp.is_holder = true
          this.$set(this.data, this.currentTab, cloneDeep(resp))
        })
        .then(() => {
          this.show = true
        })
        .catch(e => {
          this.$message.warn(e.message + '. Заполните данные клиента вручную!')
        })
    },
    calculate() {
      if (this.validAll()) {
        this.$store.dispatch('mst/SAVE_STEP_DATA', {data: this.data})
          .then(() => {
            this.$store.dispatch('mst/GET_PREMIUM', cloneDeep(this.data))
              .then(resp => {
                this.disabledSavePolicy = false;
                console.log(resp)
                this.$message.success(resp.message);
              })
              .catch(e => {
                console.log(e)
                this.$message.error(e.response.data.message);
              })
          })
          .catch(e => {
            this.$message.error(e.response.data.message)
          })
      } else {
        this.$message.error('Проверьте форму заполнения!')
        return false;
      }
    },
    save(current) {
      if (this.validAll()) {
        this.$store.dispatch('mst/SAVE_STEP_DATA', {data: this.data})
          .then(() => {
            this.$message.success('Сохранено!');
            this.$store.dispatch('mst/CHANGE_STEP', current)
          })
      } else {
        this.$message.error('Проверьте форму заполнения!')
        return false;
      }
    },
    async cancelPolicy() {
      let result = await this.$store.dispatch('mst/SET_CANCELLATION', this.policy_number);

      if(result.success) this.$message.success(result.message)
      else this.$message.error(result.message)
    },
    setPolicy(isDraft) {
      if (this.validAll()) {
        this.$store.commit('mst/SET_DATA', {is_draft: isDraft})

        if(this.$route.params.id !== 'new') {
          this.$store.commit('mst/SET_DATA', {policy_id: this.$route.params.id})
        }

        this.$store.dispatch('mst/SAVE_STEP_DATA', {data: this.data})
            .then(async () => {
              let resp = await this.$store.dispatch('mst/SET_POLICY')

              if(resp.success) {
                await this.$message.success(resp.message)
                await this.$router.push({path: `/mst/${resp.data.id}`})
              } else {
                await this.$message.error(resp.message)
              }
            })
            .catch(e => {
              this.$message.error(e.message)
            })
      } else {
        this.$message.error('Проверьте форму заполнения!')
        return false;
      }
    }
  },
  watch: {
    currentTab(n,o) {
      this.$set(this, 'prevTab', o)
    }
  },
  computed: {
    ...mapGetters(['userAgents', 'isManager', 'isAgent']),
    ...mapGetters('mst', ['policyCanceled', 'policyDone', 'policyDraft']),
    ...mapState('mst', {
      countries: state => state.countries,
      loading: state => state.loading,
      current: state => state.currentStep,
      documentTypes: state => state.documentTypes,
      policy_id: state => state.policy_id,
      policy_number: state => state.policy_number,
    }),
  },
}
</script>

<style lang="scss" scoped>
.item-wrap {
  background: rgb(244, 245, 247);
  border-radius: 12px;
  padding: 10px 0;
  margin-bottom: 24px;
  & .ant-row.ant-form-item {
    margin-bottom: 12px!important;
  }
}
</style>