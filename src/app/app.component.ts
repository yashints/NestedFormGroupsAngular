import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  packageForm: FormGroup;
  serviceList: Array<any> = [
    { name: 'ADSL', code: 'ADSL', selected: false },
    { name: 'Cable Broad Band', code: 'CBL', selected: false },
    { name: 'Foxtel TV', code: 'FOXTEL', selected: true },
    { name: 'Home Wireless', code: 'HWL', selected: true },
    { name: '4G Network', code: '4G', selected: false }
  ];
  services: FormArray;

  constructor(private fb: FormBuilder) {
    this.services = this.buildServiceList();
  }

  ngOnInit(): void {
    this.packageForm = this.fb.group({
      name: ['', Validators.required],
      serviceInfo: this.fb.group({
        deliveryDate: '',
        services: this.services
      })

    });
  }

  buildServiceList() {
    const arr = this.serviceList.map(service => {
      return this.fb.control(service.selected);
    });
    return this.fb.array(arr);
  }

  onSubmit() {
    const formValue = Object.assign({}, this.packageForm.value, {
     selectedServices:  this.getSelectedServices()
    });
    console.log(formValue);
  }

  getSelectedServices() {
    return this.packageForm.value.services.filter(x=> x).map((selected, i) => this.serviceList.map( service => service.code ));
  }
}
