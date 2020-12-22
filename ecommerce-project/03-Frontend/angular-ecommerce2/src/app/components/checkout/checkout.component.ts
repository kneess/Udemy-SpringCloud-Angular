import { JsonpClientBackend } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { Luv2ShopFormService } from 'src/app/services/luv2-shop-form.service';
import { Luv2ShopValidators } from 'src/app/validators/luv2-shop-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkOutFormGroup: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];
  
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];


  constructor(private formBuilder: FormBuilder,
              private luv2ShopFormService: Luv2ShopFormService) { }

  ngOnInit(): void {

    this.checkOutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',[Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        lastName: new FormControl('',[Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        email: new FormControl('',
                        [Validators.required, Validators.pattern('^a-z0-9._%+-@[a-z0-9.-]+\\.[a-z]{2,4}$')]
        )
      }),
      shippingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),
      billingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),
      creditCard: this.formBuilder.group({
        cartType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    //populate credit card months
    const startMonth: number = new Date().getMonth() + 1;
    console.log("startMonth: "+ startMonth);

    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card Months: "+JSON.stringify(data));
        this.creditCardMonths = data;
      }
    )

    //populate credit card years
    this.luv2ShopFormService.getCreditCardYears().subscribe(
      data => {
        console.log("Retrieved credit card years: "+JSON.stringify(data));
        this.creditCardYears = data;
      }
    )

    //populate countries
    this.luv2ShopFormService.getCountries().subscribe(
      data => {
        console.log("Retrieved countries: "+ JSON.stringify(data));
        this.countries = data;
      }
    );

    //ngOnInit end bracket
  }

  onSubmit() {
    console.log("handling the submit button");

    if(this.checkOutFormGroup.invalid) {
      this.checkOutFormGroup.markAllAsTouched();
    }

    console.log(this.checkOutFormGroup.get('customer').value);
    console.log("The email address is: " + this.checkOutFormGroup.get('customer').value.email);

    console.log("The shipping address country is: " + this.checkOutFormGroup.get('shippingAddress').value.country.name);
    console.log("The shipping address state is: " + this.checkOutFormGroup.get('shippingAddress').value.state.name);
  }

  get firstName() { return this.checkOutFormGroup.get('customer.firstName');}
  get lastName() { return this.checkOutFormGroup.get('customer.lastName');}
  get email() { return this.checkOutFormGroup.get('customer.email');}

  copyShippingAddressToBillingAddress(event){
    if(event.target.checked){
      this.checkOutFormGroup.controls.billingAddress
        .setValue(this.checkOutFormGroup.controls.shippingAddress.value);

        //bug fix for states
        this.billingAddressStates = this.shippingAddressStates;
    }
    else {
      this.checkOutFormGroup.controls.billingAddress.reset();

      //bug fix for states
      this.billingAddressStates = [];
    }
  }

  handleMonthsAndYears() {

    const creditCardFormGroup = this.checkOutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup.value.expirationYear);

    //if the current year equals the selected year, then start witht the current month

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    }
    else {
      startMonth = 1;
    }

    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card months: "+ JSON.stringify(data));
        this.creditCardMonths = data;
      }
    )
  }

  getStates(formGroupName: string){

    const formGroup = this.checkOutFormGroup.get(formGroupName);

    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.luv2ShopFormService.getStates(countryCode).subscribe(
      data => {

        if(formGroupName === 'shippingAddress'){
          this.shippingAddressStates = data;
        }
        else {
          this.billingAddressStates = data;
        }

        // select first item by default
        formGroup.get('state').setValue(data[0]);
      }
    )
  };

}
