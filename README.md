# How to use nested form groups using ReactiveForms in Angular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.6.0.

This project was created as part of [my blog post](https://blog.mehraban.com.au/2017/12/15/nested-formgroups-reactiveforms-angular/) on how to use nested form groups when using Reactive Forms in Angular with complex objects.

Before I start, let's see what does reactive mean.

When talking about <a href="https://angular.io/guide/reactive-forms">reactive forms</a>, it means that we are avoiding to use <code>ngModel</code>, <code>required</code> and so on. This means that instead of showing that Angular is taking care of the form for us, we can use the underlying APIs to do so. In a simpler term instead of using template driven model binding, we can construct our own form and the way they should be bound, validated and so on. For more information please refer to <a href="https://angular.io/guide/reactive-forms">Angular documentation here</a>.

Now if you are creating a form in <a href="https://angular.io/">Angular </a>using Reactive Forms and you a complex object to bind to i.e. your form has multiple sections and each of them should be bound to a child object, then you can simply use <a href="https://angular.io/api/forms/FormControl#formcontrol">FormControl</a> on an input like this:
<pre class="lang:xhtml decode:true">&lt;input formControlName="parent.child.property" /&gt;</pre>
<!--more-->

Instead you can use nested form groups that make it easy to understand and prevent you from having a large flat object to use in your bindings. So let's see how we should do it properly.

Let's assume we have a form to let user select some services they want to purchase as part of a package. Each service is presented in UI as a checkbox which user can check or uncheck.
<blockquote>Assumptions I've made: You are familiar with Angular and also had some basic exposure to Reactive Forms.</blockquote>
Our model would look something like this:
<pre class="lang:js decode:true">export class Package {
  name: string;
  serviceInfo: ServiceInfo;
}

export class ServiceInfo {
  deliveryDate: Date;
  services: Array&lt;string&gt;;
}</pre>
And we can then create the form group using the FormBuilder which we can inject into our constructor:
<pre class="lang:js decode:true">packageForm: FormGroup;

constructor(private fb: FormBuilder) {
  
}

ngOnInit(): void {
    this.packageForm = this.fb.group({
      name: ['', Validators.required],
      serviceInfo: this.fb.group({
        deliveryDate: '',
        services: this.fb.FormArray()
      })
    });
  }</pre>
For now I just used an array but we will change this shortly after we created our service catalogue object:
<pre class="lang:js decode:true ">serviceList: Array&lt;any&gt; = [
    { name: 'ADSL', code: 'ADSL', selected: false },
    { name: 'Cable Broad Band', code: 'CBL', selected: false },
    { name: 'Foxtel TV', code: 'FOXTEL', selected: true },
    { name: 'Home Wireless', code: 'HWL', selected: true },
    { name: '4G Network', code: '4G', selected: false }
  ];</pre>
Now we can create a method which will generate the desired <code>FormArray</code> for us (just to keep the form group creation clean) using the above catalogue:
<pre class="lang:js decode:true ">buildServiceList() {
    const arr = this.serviceList.map(service =&gt; {
      return this.fb.control(service.selected);
    });
    return this.fb.array(arr);
  }</pre>
This method will simply create a <code>FormArray</code> and adds <code>Boolean</code> controls to it where the service's selected property is <code>true</code>. We can now use this method to generate our <code>FormGroup</code>:
<pre class="lang:js decode:true "> ngOnInit(): void {
    this.packageForm = this.fb.group({
      name: ['', Validators.required],
      serviceInfo: this.fb.group({
        deliveryDate: '',
        services: this.buildServiceList()
      })

    });
  }</pre>
So far we have defined our <code>FormGroup</code> and we can now use it in our HTML template.
<pre class="lang:js decode:true">&lt;div class="container"&gt;
  &lt;h1&gt;Select your services&lt;/h1&gt;
  &lt;form [formGroup]="packageForm" (submit)="onSubmit()"&gt;
      &lt;div class="form-group"&gt;
        &lt;label for="name"&gt;Your name:&lt;/label&gt;
        &lt;input name="name" formControlName="name" /&gt;
      &lt;/div&gt;
      &lt;div formGroupName="serviceInfo"&gt;
        &lt;div class="form-group"&gt;
          &lt;label&gt;Delivery Date:&lt;/label&gt;
          &lt;input formControlName="deliveryDate" type="date"/&gt;
        &lt;/div&gt;
          &lt;div class="form-group"&gt;
              &lt;label&gt;Services:&lt;/label&gt;
              &lt;div *ngFor="let service of services.controls; let i = index"&gt;
                  &lt;label&gt;
                      &lt;input type="checkbox"
                             [formControl]="service"
                             value="{{serviceList[i].code}}"/&gt;
                      {{serviceList[i].name}}
                  &lt;/label&gt;
              &lt;/div&gt;
          &lt;/div&gt;
      &lt;/div&gt;
      &lt;div&gt;
        &lt;button class="btn btn-primary"&gt;Save&lt;/button&gt;
      &lt;/div&gt;
  &lt;/form&gt;
  &lt;br/&gt;
  &lt;div class="well"&gt;
    {{packageForm.value | json}}
  &lt;/div&gt;
&lt;/div&gt;

</pre>
In this template, I've used a form which has <code>[formGroup]</code> to use our <code>packageForm</code>. Then I've defined a form control for the name property.

Once that is done it is now time to go ahead and create the template for the child <code>FormGroup</code>.  As you can see we need a container element (I've used <code>div</code> in this case but you can use <code>ng-container</code> if you don't want any element on DOM for that). We tell Angular that this part should be assigned to a <code>FormGroup</code> named "serviceInfo".

Now we define our delivery date as normal formControl and when it comes to services we can then loop through the services array and generate them. There are two ways to access the array. As you can see in the above template I've stored the array in a class property and then used it to keep my template more readable.

However you can access it like this using the packageForm:
<pre class="lang:js decode:true ">&lt;div *ngFor="let service of packageForm.controls.serviceInfo.controls.services.controls; let i = index"&gt;&lt;/div&gt;</pre>
You can see why I've stored it in a local variable now. Now when you make changes to the form, you can see it below when I am just outputting the value of the form.

Alright we just need to extract the selected services when the form is submitted. I've created another method to do so:
<pre class="lang:js decode:true">getSelectedServices() {
  return this.packageForm.value.services.filter(x=&gt; x).map((selected, i) =&gt; this.serviceList.map( service =&gt; service.code ));
}</pre>
You can then call this on submit to extract the services and save it as an <code>Array&lt;string&gt;:</code>
<pre class="lang:js decode:true">onSubmit() {
    const formValue = Object.assign({}, this.packageForm.value, {
     selectedServices:  this.getSelectedServices()
    });
    console.log(formValue);
}</pre>
And that's it. Hope this helps people like me who are looking to use complex objects in their UI forms and want to use <code>Reactive Forms</code> as their desired method.

And as always don't forget to spread the love by sharing this if it was useful, and also feedback always is welcomed.


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
