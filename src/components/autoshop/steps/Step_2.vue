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
      <a-form-model-item prop="is_holder" v-bind="formItemLayoutWithOutLabel" style="display:none">
        <a-checkbox v-model="data.is_holder" :checked="false" name="is_holder">
          Застрахованный
        </a-checkbox>
      </a-form-model-item>
      <a-form-model-item v-bind="formItemLayoutWithOutLabel">
        <a-checkbox :disabled="!policyDraft" v-model="data.resident_bool" :value="1" name="type">
          Резидент
        </a-checkbox>
        <a-checkbox :disabled="!policyDraft" v-model="data.customer_is_holder" :value="1" name="type">
          Страхователь является застрахованным
        </a-checkbox>
      </a-form-model-item>
      <a-form-model-item v-if="data.resident_bool" prop="iin" label="ИИН">
        <a-input-search :disabled="!policyDraft" style="width: 400px" v-model="data.iin" placeholder="Введите ИИН" @search="onSearchClient" enter-button="Поиск"/>
      </a-form-model-item>
      <a-form-model-item prop="country_code" label="Страна резид.ва">
        <a-select
            :loading="loading"
            show-search
            :default-active-first-option="false"
            :filter-option="filterOption"
            v-model="data.country_code"
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
          <a-select :disabled="!policyDraft" placeholder="Выберите тип документа" style="width: 400px" v-model="data.document_type_id">
            <a-select-option v-for="type in documentTypes" :key="type.id" :value="type.esbd_id">{{type.title}}</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item prop="document_number" label="Номер документа">
          <a-input :disabled="!policyDraft" style="width: 400px" v-model="data.document_number" placeholder="Введите номер документа"/>
        </a-form-model-item>
        <a-form-model-item prop="document_gived_date" label="Дата выдачи док.">
          <a-input v-mask="'##.##.####'" :disabled="!policyDraft" style="width: 400px" v-model="data.document_gived_date" placeholder="Дата выдачи документа"/>
        </a-form-model-item>
        <a-form-model-item prop="document_gived_by" label="Кем выдан">
          <a-input :disabled="!policyDraft" style="width: 400px" v-model="data.document_gived_by" placeholder="Введите номер документа"/>
        </a-form-model-item>
      </div>
      <a-form-model-item prop="last_name" label="Фамилия">
        <a-input :disabled="!policyDraft" style="width: 195px;" v-model="data.last_name" placeholder="Введите фамилию"/>
        <a-input :disabled="!policyDraft" style="width: 195px;margin-left:10px" v-model="data.last_name_eng" placeholder="на латинице"/>
      </a-form-model-item>
      <a-form-model-item prop="first_name" label="Имя">
        <a-input :disabled="!policyDraft" style="width: 195px" v-model="data.first_name" placeholder="Введите имя"/>
        <a-input :disabled="!policyDraft" style="width: 195px;margin-left:10px" v-model="data.first_name_eng" placeholder="на латинице"/>
      </a-form-model-item>
      <a-form-model-item prop="middle_name" label="Отчество">
        <a-input :disabled="!policyDraft" style="width: 195px" v-model="data.middle_name" placeholder="Введите отчество"/>
        <a-input :disabled="!policyDraft" style="width: 195px;margin-left:10px" v-model="data.middle_name_eng" placeholder="на латинице"/>
      </a-form-model-item>
      <div class="item-wrap">
        <a-form-model-item prop="born" label="Дата рождения">
          <a-input v-mask="'##.##.####'" :disabled="!policyDraft" style="width: 400px" v-model="data.born" placeholder="Дата рождения"/>
        </a-form-model-item>
        <a-form-model-item prop="sex_id" label="Пол">
          <a-select :disabled="!policyDraft" placeholder="Выберите пол" style="width: 400px" v-model="data.sex_id">
            <a-select-option :key="1" :value="1">Муж.</a-select-option>
            <a-select-option :key="2" :value="2">Жен.</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item prop="address" label="Адрес">
          <a-input :disabled="!policyDraft" style="width: 400px" v-model="data.address" placeholder="Введите адрес"/>
        </a-form-model-item>
        <a-form-model-item prop="email" label="Почта">
          <a-input :disabled="!policyDraft" style="width: 400px" v-model="data.email" placeholder="Введите почту"/>
        </a-form-model-item>
        <a-form-model-item prop="mobile_phone" label="Телефон">
          <a-input v-mask="'+7 (7##) ### ## ##'" :disabled="!policyDraft" style="width: 400px" v-model="data.mobile_phone" placeholder="Введите номер телефона"/>
        </a-form-model-item>
      </div>
      <a-divider />
      <a-space :size="24">
        <a-button icon="caret-left" :disabled="current === 0" @click="()=>save(current-1)">Пред.</a-button>
        <a-button type="primary" icon="save" @click="()=>save(current+1)">Сохранить</a-button>
      </a-space>
    </a-form-model>
  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex"
import {cloneDeep} from 'lodash'
import {mask} from 'vue-the-mask'

export default {
  directives: {mask},
  props: {
    stepData: Object
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
        email: [
          {required: true, message: "Заполните почту"},
          {type: 'email', message: "Укажите корректный email"}
        ]
      }
    }
  },
  async mounted() {
    await this.$store.dispatch('autoshop/LOAD_DOCUMENT_TYPES')

  },
  methods: {
    filterOption(input, option) {
      return (
          option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    onSearchClient(value) {
      this.$store.dispatch('autoshop/SEARCH_CLIENT', {iin: value, natural_person_bool: 1, resident_bool: this.data.resident_bool?1:0})
        .then(resp => {
          resp.phone = resp.mobile_phone
          resp.resident_bool = !!resp.resident_bool
          resp.customer_is_holder = true
          resp.is_holder = false
          if(resp.resident_bool) {
            resp.country_code = 'KAZ'
          }
          this.data = cloneDeep(resp)
        })
        .then(() => {
          this.show = true
        })
        .catch(e => {
          this.$message.warn(e.message + '. Заполните данные клиента вручную!')
        })
    },
    save(next) {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$store.dispatch('autoshop/SAVE_STEP_DATA', {data: this.data})
            .then(() => {
              if(next > this.current) {
                if(this.data.customer_is_holder) {
                  let data = cloneDeep(this.data)
                  data.is_holder = true
                  this.$store.dispatch('autoshop/SAVE_STEP_DATA', {data: [data], step: next})
                }
                else this.$store.dispatch('autoshop/SAVE_STEP_DATA', {data: [{is_holder: true}], step: next})
              }
            })
            .then(() => {
              this.$message.success('Сохранено!');
              this.$store.dispatch('autoshop/CHANGE_STEP', next)
            })
        } else {
          this.$message.error('Проверьте форму заполнения!')
          return false;
        }
      })
    },
  },

  computed: {
    ...mapGetters(['userAgents', 'isManager', 'isAgent']),
    ...mapGetters('autoshop', ['policyDraft']),
    ...mapState('autoshop', {
      loading: state => state.loading,
      current: state => state.currentStep,
      countries: state => state.countries,
      documentTypes: state => state.documentTypes
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