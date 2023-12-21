import IUser from "./IUser";
import User, {Rating} from "./User";

class Lender extends User {
    public rating?: Rating;

    constructor(user: IUser, ratingValue: number | undefined, ratingMessage: string | undefined) {
        super(user);
        this.rating = {value: ratingValue, message: ratingMessage}
    }
}

export default Lender;