<template>
  <div class="">
    <a-row>
      <a-col :xs="24" :sm="24" :md="12" :lg="8" :xl="5" :xxl="3">
        <a-avatar :size="164" icon="user" />
      </a-col>
      <a-col :xs="24" :sm="24" :md="12" :lg="16" :xl="19" :xxl="21">
        <h2>{{ user.name }}</h2>
        <h1>{{ user.department }}</h1>
        <h1>{{ user.position }}</h1>
      </a-col>
    </a-row>
    <a-row>
      <a-skeleton :paragraph="{rows: 8}" />
    </a-row>
  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
  data() {
    return {
      fileList: [
        {
          uid: '-1',
          name: 'xxx.png',
          status: 'done',
          url: 'http://www.baidu.com/xxx.png',
        },
      ],
    };
  },
  methods: {
    handleChange(info) {
      let fileList = [...info.fileList];

      // 1. Limit the number of uploaded files
      //    Only to show two recent uploaded files, and old ones will be replaced by the new
      fileList = fileList.slice(-2);

      // 2. read from response and show file link
      fileList = fileList.map(file => {
        if (file.response) {
          // Component will show file.url as link
          file.url = file.response.url;
        }
        return file;
      });

      this.fileList = fileList;
    },
  },
  computed: {
    ...mapState('users', {
      user: state => state.user
    })
  },
};
</script>