//验证是否填写用户id
function checkUserid() {
    const userid = document.getElementById('userid').value;
    if (!userid) {
        //在us-error-message中显示错误信息
        document.getElementById('us-error-message').textContent = '用户id不能为空';
        return false;
    }
    else {
        document.getElementById('us-error-message').textContent = '';
        return true;
    }
}
//验证是否填写手机号且手机号格式正确
function checkPhone() {
    const phone = document.getElementById('phone').value;
    //验证是否填写手机号
    if (!phone) {
        //在ph-error-message中显示错误信息
        document.getElementById('ph-error-message').textContent = '手机号不能为空';
        return false;
    }
    //检验手机号是否为11位数字
    if (!/^\d{11}$/.test(phone)) {
        //在ph-error-message中显示错误信息
        document.getElementById('ph-error-message').textContent = '手机号为11位数字';
        return false;
    }
    document.getElementById('ph-error-message').textContent = '';
    return true;
}
//验证是否填写密码且密码格式正确
function checkPassword() {
    const password = document.getElementById('password').value;
    //验证是否填写密码
    if (!password) {
        //在pa-error-message中显示错误信息
        document.getElementById('pa-error-message').textContent = '密码不能为空';
        return false;
    }
    //检验密码是否为6-16位数字和字母组合
    if (!/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/.test(password)) {
        //在pa-error-message中显示错误信息
        document.getElementById('pa-error-message').textContent = '密码为6-16位数字和字母组合';
        return false;
    }
    document.getElementById('pa-error-message').textContent = '';
    return true;
}
//验证是否填写确认密码
function checkConfirmPassword() {
    const confirmPassword = document.getElementById('confirm-password').value;
    if (!confirmPassword) {
        //在cp-error-message中显示错误信息
        document.getElementById('cp-error-message').textContent = '确认密码不能为空';
        return false;
    }
    else {
        document.getElementById('cp-error-message').textContent = '';
        return true;
    }
}
//加盐哈希
function simpleHash(password, salt) {
    let hash = 0;
    let i;

    // 将密码和盐值拼接
    const saltedPassword = password + salt;

    // 遍历拼接后的字符串中的每个字符
    for (i = 0; i < saltedPassword.length; i++) {
        // 将字符转换为ASCII值，然后与当前哈希值进行简单的位运算
        hash = hash + saltedPassword.charCodeAt(i);
        hash = ((hash << 5) - hash) + saltedPassword.charCodeAt(i); // 左移5位，然后减去旧的哈希值
        hash = hash ^ (hash >> 12); // 右移12位后与当前哈希值异或
        hash = (hash + 0xABCDEF) + 0x1111; // 添加魔术数字
        hash = hash ^ (hash << 16); // 左移16位后与当前哈希值异或
    }

    // 将哈希值转换为32位十六进制字符串
    let hexHash = (0x100000000 + hash).toString(16).substring(1);

    return hexHash;
}