module.exports = class UserDto {
    username
    email
    user_id
    isActivated
    current_roles

    constructor(model) {
        this.username = model.username
        this.email = model.email
        this.user_id = model.user_id
        this.isActivated = model.isActivated
        this.current_roles = model.current_roles
    }
}
