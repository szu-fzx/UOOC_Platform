//Verify if user ID is filled
function checkUserid() {
    const userid = document.getElementById('userid').value;
    if (!userid) {
        //Show error in us-error-message
        document.getElementById('us-error-message').textContent = 'User ID cannot be empty';
        return false;
    }
    else {
        document.getElementById('us-error-message').textContent = '';
        return true;
    }
}
//Verify phone number and format
function checkPhone() {
    const phone = document.getElementById('phone').value;
    //Verify if phone is filled
    if (!phone) {
        //Show error in ph-error-message
        document.getElementById('ph-error-message').textContent = 'Phone number cannot be empty';
        return false;
    }
    //Check if phone is 11 digits
    if (!/^\d{11}$/.test(phone)) {
        //Show error in ph-error-message
        document.getElementById('ph-error-message').textContent = 'Phone number must be 11 digits';
        return false;
    }
    document.getElementById('ph-error-message').textContent = '';
    return true;
}
//Verify password and format
function checkPassword() {
    const password = document.getElementById('password').value;
    //Verify if password is filled
    if (!password) {
        //Show error in pa-error-message
        document.getElementById('pa-error-message').textContent = 'Password cannot be empty';
        return false;
    }
    //Check if password is 6-16 characters with letters and numbers
    if (!/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/.test(password)) {
        //Show error in pa-error-message
        document.getElementById('pa-error-message').textContent = 'Password must be 6-16 characters with letters and numbers';
        return false;
    }
    document.getElementById('pa-error-message').textContent = '';
    return true;
}
//Verify confirm password
function checkConfirmPassword() {
    const confirmPassword = document.getElementById('confirm-password').value;
    if (!confirmPassword) {
        //Show error in cp-error-message
        document.getElementById('cp-error-message').textContent = 'Confirm password cannot be empty';
        return false;
    }
    else {
        document.getElementById('cp-error-message').textContent = '';
        return true;
    }
}
// Salted Hash
function simpleHash(password, salt) {
    let hash = 0;
    let i;

    // Join password and salt
    const saltedPassword = password + salt;

    // Traverse each character in the joined string
    for (i = 0; i < saltedPassword.length; i++) {
        // Convert character to ASCII value, then simple bitwise operation
        hash = hash + saltedPassword.charCodeAt(i);
        hash = ((hash << 5) - hash) + saltedPassword.charCodeAt(i); // Left shift 5, subtract old hash
        hash = hash ^ (hash >> 12); // Right shift 12, XOR with current hash
        hash = (hash + 0xABCDEF) + 0x1111; // Add magic number
        hash = hash ^ (hash << 16); // Left shift 16, XOR with current hash
    }

    // Convert hash to 32-bit hex string
    let hexHash = (0x100000000 + hash).toString(16).substring(1);

    return hexHash;
}