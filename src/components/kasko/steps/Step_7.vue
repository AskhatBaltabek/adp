<template>
  <div>
    <h2></h2>
    <a-form-model
      ref="ruleForm"
      :rules="rules"
      style="width: 900px"
      :label-col="{ span:5 }"
      :wrapper-col="{ span: 19 }"
      :model="data"
      @submit.native.prevent
    >
      <a-space :size="8" direction="vertical">
        <a-card :bordered="false" size="small">
          <h3 slot="title"><b>Страхователь</b></h3>
          <h2 style="text-transform: uppercase;">{{ holder.fio }}</h2>
          <span class="subtitle ant-page-header-heading-sub-title">{{ holder.iin }}</span>
        </a-card>
        <a-card :bordered="false" size="small" style="width: 900px">
          <h3 slot="title"><b>Выгодоприобретатель</b></h3>
          <h2 style="text-transform: uppercase;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">{{ beneficiary.name }}</h2>
          <span class="subtitle ant-page-header-heading-sub-title">{{ beneficiary.iin }}</span>
        </a-card>
        <a-card :bordered="false" size="small">
          <h3 slot="title"><b>Застрахованный ТС</b></h3>
          <h2 style="text-transform: uppercase;">{{ car.number }}</h2>
          <span class="subtitle ant-page-header-heading-sub-title">{{ car.MARK }} {{ car.MODEL }}</span>
        </a-card>
      </a-space>
      <a-form-model-item>
      </a-form-model-item>
      <a-form-model-item prop="insurance_start_date" label="Дата начала полиса">
        <a-date-picker :disabled-date="disabledDate" size="large" placeholder="Укажите" v-model="data.insurance_start_date" format="DD.MM.YYYY" />
      </a-form-model-item>
      <a-divider />
      <a-space v-if="showSave" :size="24">
        <a-button @click="()=>save(0)">Сохранить черновик</a-button>
        <a-button type="primary" @click="()=>save(1)">Выписать полис</a-button>
      </a-space>
      <template v-else>
        <h3>Номер полиса: <b>{{ data.policy_number }}</b></h3>
        <a-space :size="24">
          <a-button icon="save" type="primary" @click="()=>print()">Скачать договор</a-button>
          <a-button :disabled="isPolicyCanceled" icon="stop" type="danger" @click="()=>rescinding()">{{ isPolicyCanceled ? 'Полис отменен' : 'Ошибка оператора' }}</a-button>
        </a-space>
      </template>
    </a-form-model>
  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";
import {downloadFile} from "@/helpers/fileHelper";
import moment from 'moment/src/moment'

export default {
  props: {
    stepData: Object
  },
  data() {
    return {
      show: true,
      data: Object.assign({}, this.stepData),
      showSave: !this.stepData.policy_number,
      rules: {
        insurance_start_date: [
          {required:true, message: 'Укажите дату начала полиса'}
        ]
      },
    }
  },
  methods: {
    disabledDate(current) {
      // Can not select days before today and today
      return current < moment().startOf('day');
    },
    print() {
      let params = {
        key: this.doc[this.product_code],
        policy_id: this.$route.params.id
      };

      this.$store.dispatch('PRINT_COMPRED', params)
          .then(resp => {
            downloadFile(resp.data.data.fileName, 'data:application/octet-stream;base64,' + resp.data.data.file)
          });
    },
    rescinding() {
      this.$store.dispatch('RESCINDING_POLICY', this.data.policy_number)
        .then(resp => {
          this.$set(this.data, 'status', resp.data.data.status)
          this.$message.success(resp.data.message)

        })
        .then(() => {
          this.$store.dispatch('SAVE_STEP_DATA', this.data)
        })
        .catch(e => {
          console.log(e)
          console.log(e.response)
          this.$message.error(e.response ? e.response.data.message : e)
        });
    },
    onChange() {
      this.data.payment_count = null
    },
    onSearch() {

    },
    save(status) {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.$store.dispatch('SAVE_STEP_DATA', this.data)
            .then(() => {
              this.$store.dispatch('SET_POLICY', status)
                  .then(resp => {
                    this.$message.success({content: resp.data.message, duration: 2});
                    if(resp.data.data.policy_number) {
                      this.showSave = false
                    }
                    this.data.policy_number = resp.data.data.policy_number
                    this.data.policy_id = resp.data.data.id
                    if(resp.data.data.id+"" === this.$route.params.id) {
                      return 0
                    } else {
                      this.$router.push({path: `/kasko/${this.data.policy_id}`})
                    }

                  })
                  .catch(e => {
                    this.$message.error(e.response.data.message)
                  })
                  .then(() => {
                    this.$store.dispatch('SAVE_STEP_DATA', this.data)
                  })
            })
        } else {
          return false;
        }
      });
    }
  },
  computed: {
    ...mapState({
      loading: state => state.kasko.loading,
      current: state => state.kasko.currentStep,
      doc: state => state.kasko.productDocsKeys
    }),
    ...mapGetters(['holder', 'beneficiary', 'car', 'product_code', 'isPolicyCanceled'])
  }
}
</script>

<style>
.subtitle{
  font-size: 16px!important;
  margin: -10px 0 !important;
}
</style>