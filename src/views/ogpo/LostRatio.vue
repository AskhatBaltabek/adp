<template>
  <div class="lost-ratio">
    <a-form-model
      ref="form"
      :model="form"
      :rules="rules"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      class="lost-ratio__form"
    >
      <a-form-model-item prop="iin" label="БИН">
        <a-input-search
          v-model="form.iin"
          placeholder="Введите БИН клиента"
          enter-button="Поиск"
          @search="onSearch"
        />
      </a-form-model-item>
    </a-form-model>

    <h1 style="margin-bottom: 15px;" v-if="!!form.id">Наименование: {{ form.juridical_person_name }}</h1>

    <ClientUnprofitableness :client-id="form.id" v-if="!!form.id"/>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import ClientUnprofitableness from '@/components/ogpo/ClientUnprofitableness'

export default {
  components: {
    ClientUnprofitableness,
  },

  data() {
    return {
      form: { iin: '' },
      rules: {
        iin: [
          { required: true, message: 'Длина поля БИН должна быть 12', trigger: 'blur' },
        ],
      },
    };
  },

  methods: {
    ...mapActions('ogpo', [
      'searchClient',
    ]),

    onSearch(iin) {
      this.form = { iin: iin };

      this.$refs.form.validate(async (valid) => {
        if (valid) {
          let rp = await this.searchClient({
            iin: iin,
            natural_person_bool: 0,
            resident_bool: 1
          });

          if (rp.success) {
            this.form = { ...rp.data };
          } else {
            this[rp.dialog]({ title: rp.message });
          }
        }
      });
    }
  },
}
</script>

<style lang="scss">
.lost-ratio {
  &__form {
    width: 600px;
    //margin: 0 auto;
  }
}
</style>